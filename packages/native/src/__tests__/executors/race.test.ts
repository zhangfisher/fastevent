import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"

describe("Race执行器测试", () => {


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
})