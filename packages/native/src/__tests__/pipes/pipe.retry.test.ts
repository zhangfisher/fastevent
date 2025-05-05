import { describe, expect, vi, beforeEach, afterEach, test } from "vitest"
import { FastEvent } from "../../event"
import { retry } from "../../pipe/retry"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("监听器Pipe操作: Retry", () => {

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe("Retry基本功能", () => {
        test("正常执行不触发重试", async () => {
            const emitter = new FastEvent()
            const mockFn = vi.fn().mockResolvedValue("success")

            emitter.on("test", mockFn, {
                pipes: [retry(3)]
            })

            const [promise] = emitter.emit("test", "data")
            await vi.runAllTimersAsync()
            await expect(promise).resolves.toBe('success')
            expect(mockFn).toHaveBeenCalledTimes(1)
        })

        test("重试后成功", async () => {
            const emitter = new FastEvent()
            const mockFn = vi.fn()
                .mockRejectedValueOnce(new Error("first error"))
                .mockRejectedValueOnce(new Error("second error"))
                .mockResolvedValue(undefined)

            emitter.on("test", mockFn, {
                pipes: [retry(2)]
            })

            const [promise] = emitter.emit("test", "data")
            await vi.advanceTimersByTimeAsync(2000) // 等待两次重试间隔
            await expect(promise).resolves.toBeUndefined()
            expect(mockFn).toHaveBeenCalledTimes(3)
        })

        test("重试次数达到上限后失败", () => {
            const emitter = new FastEvent()
            const error = new Error("failed")
            const mockFn = vi.fn()
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error)
                .mockRejectedValueOnce(error)
            const dropCallback = vi.fn()

            emitter.on("test", mockFn, {
                pipes: [retry(2, { drop: dropCallback })]
            })
            const promises = emitter.emit("test", "data")

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.allSettled(promises).then(emitResults => {
                    expect((emitResults[0] as any).value).toBe(error)
                    expect(mockFn).toHaveBeenCalledTimes(3)
                    expect(dropCallback).toHaveBeenCalledWith({
                        "type": "test",
                        "payload": "data",
                        "meta": undefined
                    }, error)
                }).finally(() => {
                    resolve()
                })
            })
        })
    })

    describe("Retry配置选项", () => {
        test("自定义重试间隔时间", async () => {
            const emitter = new FastEvent()
            const mockFn = vi.fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockResolvedValue(undefined)

            emitter.on("test", mockFn, {
                pipes: [retry(1, { interval: 500 })]
            })

            const [promise] = emitter.emit("test", "data")
            expect(mockFn).toHaveBeenCalledTimes(1)

            await vi.advanceTimersByTimeAsync(499)
            expect(mockFn).toHaveBeenCalledTimes(1)

            await vi.advanceTimersByTimeAsync(1)
            expect(mockFn).toHaveBeenCalledTimes(2)

            await expect(promise).resolves.toBeUndefined()
        })

        test("不提供drop回调时也应正确失败", () => {
            const emitter = new FastEvent()
            const error = new Error("failed")
            const mockFn = vi.fn().mockRejectedValue(error)
            emitter.on("test", mockFn, {
                pipes: [retry(2)]
            })
            const promises = emitter.emit("test", "data")

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.allSettled(promises).then(emitResults => {
                    expect((emitResults[0] as any).value).toBe(error)
                    expect(mockFn).toHaveBeenCalledTimes(3)
                }).finally(() => {
                    resolve()
                })
            })
        })
    })

    describe("Retry与FastEvent集成", () => {
        test("多个监听器使用retry管道", async () => {
            const emitter = new FastEvent()
            const results: string[] = []
            const mockFn1 = vi.fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockImplementation(() => results.push("listener1"))

            const mockFn2 = vi.fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockRejectedValueOnce(new Error("error"))
                .mockImplementation(() => results.push("listener2"))

            emitter.on("test", mockFn1, { pipes: [retry(1)] })
            emitter.on("test", mockFn2, { pipes: [retry(2)] })

            const promises = emitter.emit("test", "data")
            await vi.advanceTimersByTimeAsync(2000)
            await Promise.all(promises)

            expect(results).toEqual(["listener1", "listener2"])
            expect(mockFn1).toHaveBeenCalledTimes(2)
            expect(mockFn2).toHaveBeenCalledTimes(3)
        })

        test("多个事件同时使用retry管道", async () => {
            const emitter = new FastEvent()
            const mockFn1 = vi.fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockResolvedValue(undefined)

            const mockFn2 = vi.fn()
                .mockRejectedValueOnce(new Error("error"))
                .mockRejectedValueOnce(new Error("error"))
                .mockResolvedValue(undefined)

            emitter.on("event1", mockFn1, { pipes: [retry(1)] })
            emitter.on("event2", mockFn2, { pipes: [retry(2)] })

            const promises1 = emitter.emit("event1", "data1")
            const promises2 = emitter.emit("event2", "data2")

            await vi.advanceTimersByTimeAsync(2000)
            await Promise.all([...promises1, ...promises2])

            expect(mockFn1).toHaveBeenCalledTimes(2)
            expect(mockFn2).toHaveBeenCalledTimes(3)
        })
    })
})