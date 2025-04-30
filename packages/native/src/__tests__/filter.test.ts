import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../event"

describe("事件过滤器测试", () => {
    test("当过滤器返回true时,监听器应该被执行", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.on("test", listener, {
            filter: (message) => {
                expect(message.type).toBe("test")
                expect(message.payload).toBe(1)
                return true
            }
        })

        emitter.emit("test", 1)
        expect(listener).toHaveBeenCalledTimes(1)
    })

    test("当过滤器返回false时,监听器不应该被执行", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.on("test", listener, {
            filter: () => false
        })

        emitter.emit("test", 1)
        expect(listener).not.toHaveBeenCalled()
    })

    test("过滤器函数的this上下文应该正确", () => {
        const emitter = new FastEvent({
            context: { value: 123 }
        })
        const filterFn = vi.fn(function (this: any) {
            expect(this.value).toBe(123)
            return true
        })

        emitter.on("test", () => { }, {
            filter: filterFn
        })

        emitter.emit("test")
        expect(filterFn).toHaveBeenCalled()
    })

    test("once方法的过滤器应该正常工作", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.once("test", listener, {
            filter: () => {
                return false
            }
        })

        // 第一次触发,过滤器返回false,监听器不执行
        emitter.emit("test", 1)
        expect(listener).not.toHaveBeenCalled()

        // 第二次触发 ,由于是once,监听器已被移除
        emitter.emit("test", 2)
        expect(listener).not.toHaveBeenCalled()
    })

    test("过滤器可以基于事件payload进行过滤", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.on("test", listener, {
            filter: (message) => message.payload > 5
        })

        emitter.emit("test", 3) // 不应触发
        emitter.emit("test", 6) // 应触发
        emitter.emit("test", 4) // 不应触发
        emitter.emit("test", 8) // 应触发

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
            payload: 6
        }), {})
        expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
            payload: 8
        }), {})
    })

    test("过滤器可以基于事件元数据进行过滤", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.on("test", listener, {
            filter: (message) => message.meta?.important === true
        })

        emitter.emit("test", 1, { meta: { important: false } })
        emitter.emit("test", 2, { meta: { important: true } })
        emitter.emit("test", 3)
        emitter.emit("test", 4, { meta: { important: true } })

        expect(listener).toHaveBeenCalledTimes(2)
        expect(listener).toHaveBeenNthCalledWith(1, expect.objectContaining({
            payload: 2,
            meta: { important: true }
        }), { meta: { important: true } })
        expect(listener).toHaveBeenNthCalledWith(2, expect.objectContaining({
            payload: 4,
            meta: { important: true }
        }), { meta: { important: true } })
    })
})