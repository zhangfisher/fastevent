import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { series } from '../../executors/series'
import { FastEventMessage } from "../../types"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("Series执行器测试", () => {
    test("依次执行所有监听器返回最后一个监听器的结果", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, { executor: series() })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(10)

    }, 1000000000)
})