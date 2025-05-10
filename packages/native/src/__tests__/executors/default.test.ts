import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"

describe("Default执行器测试", () => {
    test("使用全局default执行器时应该执行所有监听器", () => {
        const emitter = new FastEvent({
            executor: 'default'
        })

        const listener1 = vi.fn(() => "result1")
        const listener2 = vi.fn(() => "result2")

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = emitter.emit("test")

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["result1", "result2"])
    })

    test("异步执行器应该正确处理Promise结果", async () => {
        const emitter = new FastEvent({
            executor: 'default'
        })

        const listener1 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return "async1"
        })
        const listener2 = vi.fn(() => "sync2")
        const listener3 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 30))
            return "async3"
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        const results = await emitter.emitAsync("test")

        expect(results).toEqual(["async1", "sync2", "async3"])
    })

    test("异步执行器应该正确处理错误", async () => {
        const emitter = new FastEvent({
            executor: 'default'
        })

        const error = new Error("测试错误")
        const listener1 = vi.fn(async () => {
            throw error
        })
        const listener2 = vi.fn(() => "success")

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = await emitter.emitAsync("test")

        expect(results[0]).toBe(error)
        expect(results[1]).toEqual("success")
    })
})