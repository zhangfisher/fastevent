import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { balance } from "../../executors/balance"

describe("Balance执行器测试", () => {


    test("使用全局balancing执行器时应该平均分配执行次数", () => {
        const emitter = new FastEvent({
            executor: balance()
        })

        const listener1 = vi.fn(() => "result1")
        const listener2 = vi.fn(() => "result2")
        const listener3 = vi.fn(() => "result3")

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        // 触发多次事件
        for (let i = 0; i < 12; i++) {
            emitter.emit("test")
        }

        // 两个监听器应该被大致平均调用
        expect(Math.abs(listener1.mock.calls.length - listener2.mock.calls.length)).toBeLessThanOrEqual(1)
        expect(Math.abs(listener1.mock.calls.length - listener3.mock.calls.length)).toBeLessThanOrEqual(1)
        expect(Math.abs(listener2.mock.calls.length - listener3.mock.calls.length)).toBeLessThanOrEqual(1)
    })
})