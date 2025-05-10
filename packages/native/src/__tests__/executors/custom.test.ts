import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"

describe("Custom执行器测试", () => {


    test("应该支持自定义执行器函数", () => {
        const customExecutor = vi.fn((listeners, message) => {
            // 自定义执行器：只执行第一个监听器
            return [listeners[0][0](message)]
        })

        const emitter = new FastEvent({
            executor: customExecutor
        })

        const listener1 = vi.fn(() => "result1")
        const listener2 = vi.fn(() => "result2")

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = emitter.emit("test", 0)

        expect(customExecutor).toHaveBeenCalled()
        expect(results).toEqual(["result1"])
        expect(listener2).not.toHaveBeenCalled()
    })
})