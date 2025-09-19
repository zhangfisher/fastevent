/**
 * 测试触发事件时传递AbortSignal参数给监听器
 */

import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { AbortError } from "../../consts"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("触发事件时传递AbortSignal参数给监听器", () => {
    test("emit方法传递AbortSignal给监听器", () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener = vi.fn((message, args) => {
            expect(args?.abortSignal).toBe(signal)
            return "result"
        })

        emitter.on("test", listener)
        const results = emitter.emit("test", undefined, {
            abortSignal: signal
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["result"])
    })

    test("emitAsync方法传递AbortSignal给监听器", async () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener = vi.fn(async (message, args) => {
            expect(args?.abortSignal).toBe(signal)
            return "async result"
        })

        emitter.on("test", listener)
        const results = await emitter.emitAsync("test", undefined, {
            abortSignal: signal
        })

        expect(listener).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["async result"])
    })

    test("传入已Abored的AbortSignal", () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener = vi.fn((message, args) => {
            return "正常执行"
        })

        emitter.on("test", listener)

        // 先正常触发
        let results = emitter.emit("test", undefined, {
            abortSignal: signal
        })
        expect(results).toEqual(["正常执行"])

        // 中断后再触发
        controller.abort()
        results = emitter.emit("test", undefined, {
            abortSignal: signal
        })
        expect(results[0]).toBeInstanceOf(AbortError)
    })

    test("emit方法传递AbortSignal给多个监听器", () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener1 = vi.fn((message, args) => {
            expect(args?.abortSignal).toBe(signal)
            return "result1"
        })
        const listener2 = vi.fn((message, args) => {
            expect(args?.abortSignal).toBe(signal)
            return "result2"
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        const results = emitter.emit("test", undefined, {
            abortSignal: signal
        })

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["result1", "result2"])
    })

    test("监听器自行处理AbortSignal并返回AbortError错误", () => {
        return new Promise<void>(resolve => {
            const emitter = new FastEvent<{ click: number }>()
            let hasAbortSignal: boolean = false
            emitter.on("click", (message, { abortSignal }) => {
                return new Promise<void>((resolve, reject) => {
                    abortSignal!.addEventListener("abort", () => {
                        hasAbortSignal = true
                        reject(new AbortError())
                    })
                    delay(1000).then(() => resolve())
                })
            })

            // 创建一个 AbortController 实例
            const abortController = new AbortController()

            // 传入 AbortController.signal
            const results = emitter.emit("click", 1, {
                abortSignal: abortController.signal
            })
            setTimeout(() => {
                abortController.abort()   // [!code ++]
                Promise.allSettled(results).then((r) => {
                    expect(r[0].status).toBe("fulfilled")
                    expect((r[0] as any).value).toBeInstanceOf(AbortError)
                    expect(hasAbortSignal).toBe(true)
                    resolve()
                })
            }, 10)
        })
    })
    test("监听器自行处理AbortSignal并返回指定值", () => {
        return new Promise<void>(resolve => {
            const emitter = new FastEvent<{ click: number }>()
            let hasAbortSignal: boolean = false
            emitter.on("click", (message, { abortSignal }) => {
                return new Promise<number>((resolve) => {
                    abortSignal!.addEventListener("abort", () => {
                        hasAbortSignal = true
                        resolve(100)
                    })
                    delay(1000).then(() => resolve(0))
                })
            })

            // 创建一个 AbortController 实例
            const abortController = new AbortController()

            // 传入 AbortController.signal
            const results = emitter.emit("click", 1, {
                abortSignal: abortController.signal
            })
            setTimeout(() => {
                abortController.abort()   // [!code ++]
                Promise.allSettled(results).then((r) => {
                    expect(r[0].status).toBe("fulfilled")
                    expect((r[0] as any).value).toBe(100)
                    expect(hasAbortSignal).toBe(true)
                    resolve()
                })
            }, 10)
        })
    })
    test("中止多个监听器", () => {
        return new Promise<void>(resolve => {
            const emitter = new FastEvent<{ click: number }>()
            const length: number = 10
            const listeners = Array.from({ length }).map((_, i) => vi.fn((message, { abortSignal }) => {
                return new Promise<number>((resolve) => {
                    delay(1000).then(() => resolve(0))
                    abortSignal!.addEventListener("abort", () => {
                        resolve(i + 1)
                    })
                })
            }))
            listeners.map(listener => emitter.on("click", listener))

            // 创建一个 AbortController 实例
            const abortController = new AbortController()

            // 传入 AbortController.signal
            const results = emitter.emit("click", 1, {
                abortSignal: abortController.signal
            })
            setTimeout(() => {
                abortController.abort()   // [!code ++]
                Promise.allSettled(results).then((emitResults) => {
                    expect(emitResults.length).toBe(length)
                    emitResults.forEach((r, i) => {
                        expect(r.status).toBe("fulfilled")
                        expect((r as any).value).toBe(i + 1)
                    })
                    resolve()
                })
            }, 10)
        })
    })
})