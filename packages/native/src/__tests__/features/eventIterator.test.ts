/**
 * FastEventIterator 测试
 * 测试使用 queue.ts 中的队列参数和逻辑重构后的功能
 * 使用 Bun 测试 API
 */

import { describe, test, expect } from "bun:test";
import { FastEvent } from "../../event";
import { createAsyncEventIterator } from "../../eventIterator";

async function delay(time: number = 1) {
    return new Promise<void>((resolve) => {
        setTimeout(resolve, time);
    });
}

describe("FastEventIterator", () => {
    test("应该正确创建异步迭代器并消费事件", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "test");
        iterator.create();
        // 发送消息
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");
        emitter.emit("test", "message3");

        const results: string[] = [];
        for await (const message of iterator) {
            results.push(message.payload);
            if (results.length === 3) break;
        }

        expect(results).toEqual(["message1", "message2", "message3"]);
    });

    test("应该支持滑动窗口溢出策略（slide）", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "slide", {
            size: 3,
            overflow: "slide",
        });
        iterator.create();

        // 发送5条消息，缓冲区大小为3
        for (let i = 0; i < 5; i++) {
            emitter.emit("slide", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 3) break;
        }

        // 应该保留最后3条消息（2, 3, 4）
        expect(results).toEqual([2, 3, 4]);
    });

    test("应该支持丢弃溢出策略（drop）", async () => {
        const emitter = new FastEvent();
        let dropCount = 0;
        const droppedMessages: number[] = [];
        const iterator = createAsyncEventIterator(emitter, "drop", {
            size: 3,
            overflow: "drop",
            onDrop: (message) => {
                dropCount++;
                droppedMessages.push(message.payload);
            },
        });
        iterator.create();

        // 发送5条消息，缓冲区大小为3
        for (let i = 0; i < 5; i++) {
            emitter.emit("drop", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 3) break;
        }

        // 应该只保留前3条消息（0, 1, 2）
        expect(results).toEqual([0, 1, 2]);
        // 第4和第5条消息应该被丢弃
        expect(dropCount).toBe(2);
        expect(droppedMessages).toEqual([3, 4]);
    });

    test("应该支持扩展溢出策略（expand）", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "expand", {
            size: 2,
            maxExpandSize: 6,
            overflow: "expand",
        });
        iterator.create();
        // 发送6条消息，初始大小为2，最大为6
        for (let i = 0; i < 6; i++) {
            emitter.emit("expand", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 6) break;
        }

        // 应该保留所有6条消息
        expect(results).toEqual([0, 1, 2, 3, 4, 5]);
    });

    test("应该支持 lifetime 机制自动丢弃过期消息", async () => {
        const emitter = new FastEvent();
        let dropCount = 0;
        const droppedMessages: number[] = [];
        const iterator = createAsyncEventIterator(emitter, "lifetime", {
            size: 10,
            lifetime: 100, // 100ms 后过期
            onDrop: (message) => {
                dropCount++;
                droppedMessages.push(message.payload);
            },
        });
        iterator.create();
        // 发送消息
        emitter.emit("lifetime", 1);
        emitter.emit("lifetime", 2);

        // 等待超过 lifetime
        await new Promise((resolve) => setTimeout(resolve, 150));

        // 发送新消息
        emitter.emit("lifetime", 3);

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 1) break;
        }

        // 1和2应该已经过期，只应该收到3
        expect(results).toEqual([3]);
        expect(dropCount).toBeGreaterThanOrEqual(2);
        expect(droppedMessages).toContain(1);
        expect(droppedMessages).toContain(2);
    });

    test("应该支持 onPush 回调自定义消息入队逻辑", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "push", {
            size: 10,
            onPush: (message, buffer) => {
                // 添加时间戳前缀
                buffer.push([`[${Date.now()}] ${message.payload}`, 0]);
            },
        });
        iterator.create();
        emitter.emit("push", "test");

        const results: string[] = [];
        for await (const msg of iterator) {
            results.push(msg);
            if (results.length === 1) break;
        }

        expect(results[0]).toMatch(/\[\d+\] test/);
    });

    test("应该支持 onPop 回调自定义消息弹出顺序", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "pop", {
            size: 10,
            onPop: (buffer, _hasNew) => {
                // 每次都使用后进先出（LIFO）
                return buffer.pop()!;
            },
        });
        iterator.create();

        // 发送3条消息
        emitter.emit("pop", 1);
        emitter.emit("pop", 2);
        emitter.emit("pop", 3);

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 3) break;
        }

        // 应该以反转顺序接收（3, 2, 1）
        expect(results).toEqual([3, 2, 1]);
    });

    test("应该支持 AbortSignal 取消迭代", () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();
            const controller = new AbortController();
            const iterator = createAsyncEventIterator<string>(emitter, "abort", {
                signal: controller.signal,
            });
            iterator.create();
            let isAborted: boolean = false;
            async function getMessages() {
                const data: any[] = [];
                try {
                    for await (const message of iterator) {
                        data.push(message);
                    }
                } catch (e) {
                    expect(e).toBeInstanceOf(Error);
                    throw e;
                }
            }
            getMessages()
                .then(() => {})
                .catch((e: any) => {
                    expect(e).toBeInstanceOf(Error);
                    isAborted = true;
                });
            let i: number = 0;
            setTimeout(() => {
                controller.abort();
            }, 10);
            (async function emitData() {
                while (!isAborted) {
                    await delay();
                    emitter.emit("abort", i++);
                }
            })().then(resolve);
        });
    });

    test("应该支持错误处理回调", async () => {
        const emitter = new FastEvent();
        let errorHandled = false;
        const iterator = createAsyncEventIterator(emitter, "data", {
            onError: (_error) => {
                errorHandled = true;
                return Promise.resolve(false);
            },
        });
        iterator.create();
        // 发送正常消息
        emitter.emit("data", "message1");

        const results: string[] = [];
        for await (const message of iterator) {
            results.push(message.payload);
            if (results.length === 1) break;
        }

        // 验证收到了消息
        expect(results).toEqual(["message1"]);
        // 错误处理回调已配置
        expect(errorHandled).toBe(false); // 没有错误发生
    });
});

describe("FastEventIterator 辅助函数", () => {
    test("droppingIterator 应该创建丢弃新消息的迭代器", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "drop", { overflow: "drop" });
        iterator.create();
        for (let i = 0; i < 5; i++) {
            emitter.emit("drop", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 3) break;
        }

        expect(results).toEqual([0, 1, 2]);
    });

    test("slidingIterator 应该创建滑动窗口的迭代器", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "slide", {
            overflow: "slide",
            size: 3,
        });
        iterator.create();
        for (let i = 0; i < 5; i++) {
            emitter.emit("slide", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 3) break;
        }

        expect(results).toEqual([2, 3, 4]);
    });

    test("expandingIterator 应该创建可扩展的迭代器", async () => {
        const emitter = new FastEvent();
        const iterator = createAsyncEventIterator(emitter, "expand", {
            size: 2,
            maxExpandSize: 10,
            overflow: "expand",
        });
        iterator.create();
        for (let i = 0; i < 5; i++) {
            emitter.emit("expand", i);
        }

        const results: number[] = [];
        for await (const num of iterator) {
            results.push(num.payload);
            if (results.length === 5) break;
        }

        expect(results).toEqual([0, 1, 2, 3, 4]);
    });
});
