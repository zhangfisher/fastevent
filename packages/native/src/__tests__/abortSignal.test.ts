/**
 * 测试触发事件时传递AbortSignal参数给监听器
 */

import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../event"
import { FastEventMessage } from "../../dist"

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

    test("监听器可以检测AbortSignal是否已中断", () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener = vi.fn((message, args) => {
            if (args?.abortSignal?.aborted) {
                throw new Error("操作已取消")
            }
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
        expect(results[0]).toBeInstanceOf(Error)
        expect(results[0].message).toBe("操作已取消")
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

    test("emitAsync方法可以中断监听器执行", async () => {
        const emitter = new FastEvent()
        const controller = new AbortController()
        const signal = controller.signal

        const listener = vi.fn(async (message, args) => {
            await new Promise(resolve => setTimeout(resolve, 100))
            if (args?.abortSignal?.aborted) {
                throw new Error("操作已取消")
            }
            return "async result"
        })

        emitter.on("test", listener)

        // 启动异步触发但立即中断
        const promise = emitter.emitAsync("test", undefined, {
            abortSignal: signal
        })
        controller.abort()

        const results = await promise as unknown as (Error)[]
        expect(results[0]).toBeInstanceOf(Error)
        expect(results[0].message).toBe("操作已取消")
    })
})