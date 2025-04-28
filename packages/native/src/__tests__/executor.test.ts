import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../event"
import { FastEventListenerArgs } from "../types"

describe("FastEvent执行器测试", () => {
    describe("全局执行器配置", () => {
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

        test("使用全局race执行器时应该只返回最快的结果", async () => {
            const emitter = new FastEvent({
                executor: 'race'
            })

            const listener1 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 100))
                return "slow"
            })
            const listener2 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 50))
                return "fast"
            })

            emitter.on("test", listener1)
            emitter.on("test", listener2)

            const results = await emitter.emitAsync("test")

            expect(results).toEqual(["fast"])
        })

        test("使用全局balancing执行器时应该平均分配执行次数", () => {
            const emitter = new FastEvent({
                executor: 'balance'
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

    describe("Scope执行器配置", () => {
        test("Scope的执行器配置应该覆盖全局配置", async () => {
            const emitter = new FastEvent({
                executor: 'default'
            })

            const scope = emitter.scope("test", {
                executor: 'race'
            })

            const listener1 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 100))
                return "slow"
            })
            const listener2 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 50))
                return "fast"
            })

            scope.on("event", listener1)
            scope.on("event", listener2)

            const results = await scope.emitAsync("event")

            expect(results).toEqual(["fast"])
        })
    })

    describe("事件触发时指定执行器", () => {
        test("触发事件时指定的执行器应该优先于全局和Scope配置", async () => {
            const emitter = new FastEvent({
                executor: 'default'
            })

            const scope = emitter.scope("test", {
                executor: 'balance'
            })

            const listener1 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 100))
                return "slow"
            })
            const listener2 = vi.fn(async () => {
                await new Promise(resolve => setTimeout(resolve, 50))
                return "fast"
            })

            scope.on("event", listener1)
            scope.on("event", listener2)

            const options: FastEventListenerArgs = {
                executor: 'race'
            }

            const results = await scope.emitAsync("event", undefined, options)

            expect(results).toEqual(["fast"])
        })
    })

    describe("执行器优先级", () => {
        test("执行器优先级应该为: 触发时指定 > Scope配置 > 全局配置", async () => {
            const emitter = new FastEvent({
                executor: 'default'  // 最低优先级
            })

            const scope = emitter.scope("test", {
                executor: 'balance'  // 中等优先级
            })

            const listener1 = vi.fn(() => "result1")
            const listener2 = vi.fn(() => "result2")

            scope.on("event", listener1)
            scope.on("event", listener2)

            // 使用全局配置
            let results = scope.emit("event")
            expect(results).toEqual(["result1"])

            // 使用Scope配置
            results = scope.emit("event")
            expect(results.length).toBe(1) // balancing执行器每次只执行一个监听器

            // 使用触发时指定的配置
            const options: FastEventListenerArgs = {
                executor: 'default'
            }
            results = scope.emit("event", undefined, options)
            expect(results).toEqual(["result1", "result2"])
        })
    })

    describe("自定义执行器", () => {
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

            const results = emitter.emit("test")

            expect(customExecutor).toHaveBeenCalled()
            expect(results).toEqual(["result1"])
            expect(listener2).not.toHaveBeenCalled()
        })
    })

    describe("first执行器测试", () => {
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

            const results = emitter.emit("test")

            expect(listener1).toHaveBeenCalledTimes(1)
            expect(listener2).not.toHaveBeenCalled()
            expect(results[0]).toBe(error)
        })
    })

    describe("last执行器测试", () => {
        test("last执行器应该只执行最后一个监听器", () => {
            const emitter = new FastEvent({
                executor: 'last'
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
                executor: 'last'
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
                executor: 'last',
                ignoreErrors: true
            })

            const error = new Error("最后一个监听器错误")
            const listener1 = vi.fn(() => "第一个")
            const listener2 = vi.fn(() => {
                throw error
            })

            emitter.on("test", listener1)
            emitter.on("test", listener2)

            const results = emitter.emit("test")

            expect(listener1).not.toHaveBeenCalled()
            expect(listener2).toHaveBeenCalledTimes(1)
            expect(results[0]).toBe(error)
        })
    })

    describe("random执行器测试", () => {
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

            const results = emitter.emit("test")

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
                const result = emitter.emit("test")[0]
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
                const results = emitter.emit("test")
                // 结果应该是错误对象或成功字符串
                expect(results[0] === error || results[0] === "成功").toBe(true)
            }
        })
    })

    describe("异步执行器行为", () => {
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
})