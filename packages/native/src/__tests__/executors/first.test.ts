import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"

describe("First执行器测试", () => {

    test("first执行器应该只执行第一个监听器", () => {
        const emitter = new FastEvent({
            executor: 'first'
        })

        const listener1 = vi.fn(() => "第一个")
        const listener2 = vi.fn(() => "第二个")
        const listener3 = vi.fn(() => "第三个")

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        const results = emitter.emit("test")

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).not.toHaveBeenCalled()
        expect(listener3).not.toHaveBeenCalled()
        expect(results).toEqual(["第一个"])
    })

    test("first执行器在异步场景下应该只执行第一个监听器", async () => {
        const emitter = new FastEvent({
            executor: 'first'
        })

        const listener1 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return "异步第一个"
        })
        const listener2 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 10))
            return "异步第二个"
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = await emitter.emitAsync("test")

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).not.toHaveBeenCalled()
        expect(results).toEqual(["异步第一个"])
    })

    test("first执行器应该正确处理第一个监听器抛出的错误", async () => {
        const emitter = new FastEvent({
            executor: 'first',
            ignoreErrors: true
        })

        const error = new Error("第一个监听器错误")
        const listener1 = vi.fn(() => {
            throw error
        })
        const listener2 = vi.fn(() => "第二个")

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = emitter.emit("test", 0)

        expect(listener1).toHaveBeenCalledTimes(1)
        expect(listener2).not.toHaveBeenCalled()
        expect(results[0]).toBe(error)
    })

})