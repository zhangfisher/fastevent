import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { FastEventMessage } from "../../types"
import { waterfall } from "../../executors"

describe("waterfall执行器测试", () => {

    test("waterfall串行执行监听器依次传递参数", async () => {
        const emitter = new FastEvent()
        const payloads: any[] = []

        const listeners = Array.from({ length: 10 }).map((_, i) => {
            return async (message: FastEventMessage) => {
                payloads.push(message.payload)
                return i
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: waterfall()
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(9)
        expect(payloads.length).toEqual(10)
        expect(payloads).toEqual([undefined, 0, 1, 2, 3, 4, 5, 6, 7, 8])
    })
    test("waterfall串行执行监听器出错时会中断后续执行", async () => {
        const emitter = new FastEvent()
        const payloads: any[] = []

        const listeners = Array.from({ length: 10 }).map((_, i) => {
            return async (message: FastEventMessage) => {
                payloads.push(message.payload)
                if (i === 5) throw new Error("test")
                return i
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: waterfall()
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(4)
        expect(payloads.length).toEqual(6)
        expect(payloads).toEqual([undefined, 0, 1, 2, 3, 4])
    })
})