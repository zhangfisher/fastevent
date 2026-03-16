// oxlint-disable no-async-promise-executor
import { describe, expect, jest, beforeEach, afterEach, test } from "bun:test";
import { FastEvent } from "../../event";
import { retry } from "../../pipes/retry";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("监听器Pipe操作: Retry", () => {
    beforeEach(() => {
        // jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe("Retry基本功能", () => {
        test("正常执行不触发重试", async () => {
            const emitter = new FastEvent();
            const mockFn = jest.fn().mockResolvedValue("success");

            emitter.on("test", mockFn, {
                pipes: [retry({ retries: 3, interval: 10 })],
            });

            const [promise] = emitter.emit("test", "data");
            await delay(100);
            await expect(promise).resolves.toBe("success");
            expect(mockFn).toHaveBeenCalledTimes(1);
        });

        test("重试后成功", async () => {
            const emitter = new FastEvent();
            const mockFn = jest
                .fn()
                .mockRejectedValueOnce(new Error("first error"))
                .mockRejectedValueOnce(new Error("second error"))
                .mockResolvedValue(undefined);

            emitter.on("test", mockFn, {
                pipes: [
                    retry({
                        retries: 2,
                        interval: 100,
                    }),
                ],
            });

            const [promise] = emitter.emit("test", "data");
            await delay(300);
            await expect(promise).resolves.toBeUndefined();
            expect(mockFn).toHaveBeenCalledTimes(3);
        });

        test("重试次数达到上限后失败", () => {
            const emitter = new FastEvent();
            const error = new Error("failed");
            const mockFn = jest
                .fn()
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error);
            const dropCallback = jest.fn();

            emitter.on("test", mockFn, {
                pipes: [retry({ retries: 2, interval: 10, drop: dropCallback })],
            });
            const promises = emitter.emit("test", "data");

            return new Promise<void>(async (resolve) => {
                await delay(100);
                Promise.allSettled(promises)
                    .then((emitResults) => {
                        expect((emitResults[0] as any).value).toBe(error);
                        expect(mockFn).toHaveBeenCalledTimes(3);
                        expect(dropCallback).toHaveBeenCalledWith(
                            {
                                type: "test",
                                payload: "data",
                                meta: undefined,
                            },
                            error,
                        );
                    })
                    .finally(() => {
                        resolve();
                    });
            });
        });
    });

    describe("Retry与FastEvent集成", () => {
        test("多个监听器使用retry管道", async () => {
            const emitter = new FastEvent();
            const results: string[] = [];
            const mockFn1 = jest
                .fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockImplementation(() => results.push("listener1"));

            const mockFn2 = jest
                .fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockRejectedValueOnce(new Error("error"))
                .mockImplementation(() => results.push("listener2"));

            emitter.on("test", mockFn1, { pipes: [retry({ retries: 1 })] });
            emitter.on("test", mockFn2, { pipes: [retry({ retries: 2 })] });

            const promises = emitter.emit("test", "data");
            await delay(200);
            await Promise.all(promises);

            expect(results).toEqual(["listener1", "listener2"]);
            expect(mockFn1).toHaveBeenCalledTimes(2);
            expect(mockFn2).toHaveBeenCalledTimes(3);
        });

        test("多个事件同时使用retry管道", async () => {
            const emitter = new FastEvent();
            const mockFn1 = jest
                .fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockResolvedValue(undefined);

            const mockFn2 = jest
                .fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockRejectedValueOnce(new Error("error"))
                .mockResolvedValue(undefined);

            emitter.on("event1", mockFn1, { pipes: [retry({ retries: 1 })] });
            emitter.on("event2", mockFn2, { pipes: [retry({ retries: 2 })] });

            const promises1 = emitter.emit("event1", "data1");
            const promises2 = emitter.emit("event2", "data2");

            await delay(200);
            await Promise.all([...promises1, ...promises2]);

            expect(mockFn1).toHaveBeenCalledTimes(2);
            expect(mockFn2).toHaveBeenCalledTimes(3);
        });
    });
});
