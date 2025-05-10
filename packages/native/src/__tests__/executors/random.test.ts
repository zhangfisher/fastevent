import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
describe("Random执行器测试", () => {
    test("random执行器应该只执行一个随机的监听器", () => {
        const emitter = new FastEvent({
            executor: 'random'
        })

        const listener1 = vi.fn(() => "监听器1")
        const listener2 = vi.fn(() => "监听器2")
        const listener3 = vi.fn(() => "监听器3")

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        const results = emitter.emit("test", 0)

        // 验证只执行了一个监听器
        expect(
            listener1.mock.calls.length +
            listener2.mock.calls.length +
            listener3.mock.calls.length
        ).toBe(1)

        // 验证返回结果是其中一个监听器的结果
        expect(["监听器1", "监听器2", "监听器3"]).toContain(results[0])
    })

    test("random执行器在多次触发时应该随机选择不同的监听器", () => {
        const emitter = new FastEvent({
            executor: 'random'
        })

        const listener1 = vi.fn(() => "监听器1")
        const listener2 = vi.fn(() => "监听器2")
        const listener3 = vi.fn(() => "监听器3")

        emitter.on("test", listener1)
        emitter.on("test", listener2)
        emitter.on("test", listener3)

        // 触发多次事件
        const executionCounts = {
            "监听器1": 0,
            "监听器2": 0,
            "监听器3": 0
        }

        // 执行足够多次以验证随机性
        for (let i = 0; i < 50; i++) {
            const result = emitter.emit("test", 0)[0]
            executionCounts[result as keyof typeof executionCounts]++
        }

        // 验证每个监听器都被执行过
        expect(Object.values(executionCounts).every(count => count > 0)).toBe(true)
    })

    test("random执行器在异步场景下应该正确工作", async () => {
        const emitter = new FastEvent({
            executor: 'random'
        })

        const listener1 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
            return "异步监听器1"
        })
        const listener2 = vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 30))
            return "异步监听器2"
        })

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        const results = await emitter.emitAsync("test")

        // 验证只执行了一个监听器
        expect(listener1.mock.calls.length + listener2.mock.calls.length).toBe(1)

        // 验证返回结果是其中一个监听器的结果
        expect([["异步监听器1"], ["异步监听器2"]]).toContainEqual(results)
    })

    test("random执行器应该正确处理监听器抛出的错误", () => {
        const emitter = new FastEvent({
            executor: 'random',
            ignoreErrors: true
        })

        const error = new Error("测试错误")
        const listener1 = vi.fn(() => {
            throw error
        })
        const listener2 = vi.fn(() => "成功")

        emitter.on("test", listener1)
        emitter.on("test", listener2)

        // 多次触发以确保错误处理正确
        for (let i = 0; i < 10; i++) {
            const results = emitter.emit("test", 0)
            // 结果应该是错误对象或成功字符串
            expect(results[0] === error || results[0] === "成功").toBe(true)
        }
    })

})