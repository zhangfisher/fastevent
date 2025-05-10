import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { FastEventListenerArgs } from "../../types"

describe("FastEvent执行器测试", () => {

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
        let results = scope.emit("event", 0)
        expect(results).toEqual(["result1"])

        // 使用Scope配置
        results = scope.emit("event", 0)
        expect(results.length).toBe(1) // balancing执行器每次只执行一个监听器

        // 使用触发时指定的配置
        const options: FastEventListenerArgs = {
            executor: 'default'
        }
        results = scope.emit("event", undefined, options)
        expect(results).toEqual(["result1", "result2"])
    })




})