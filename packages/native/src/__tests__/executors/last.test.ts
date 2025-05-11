import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { last } from "../../executors/last"

describe("Last执行器测试", () => {

    test("last执行器应该只执行最后一个监听器", () => {
        const emitter = new FastEvent({
            executor: last()
        })

        const listener1 = vi.fn(() => "第一个")
        const listener2 = vi.fn(() => "第二个")
        const listener3 = vi.fn(() => "最后一个")

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        const results = emitter.emit("test")

        expect(listener1).not.toHaveBeenCalled()
        expect(listener2).not.toHaveBeenCalled()
        expect(listener3).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["最后一个"])
    })

    test("last执行器在异步场景下应该只执行最后一个监听器", async () => {
        const emitter = new FastEvent({
            executor: last()
        })

        const listener1 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return "异步第一个"
        })
        const listener2 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return "异步最后一个"
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = await emitter.emitAsync("test")

        expect(listener1).not.toHaveBeenCalled()
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(results).toEqual(["异步最后一个"])
    })

    test("last执行器应该正确处理最后一个监听器抛出的错误", async () => {
        const emitter = new FastEvent({
            executor: last(),
            ignoreErrors: true
        })

        const error = new Error("最后一个监听器错误")
        const listener1 = vi.fn(() => "第一个")
        const listener2 = vi.fn(() => {
            throw error
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = emitter.emit("test", 0)

        expect(listener1).not.toHaveBeenCalled()
        expect(listener2).toHaveBeenCalledTimes(1)
        expect(results[0]).toBe(error)
    })

})