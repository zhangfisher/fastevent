import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { series } from '../../executors/series'

describe("Series执行器测试", () => {
    test("series执行器应该正确处理Promise结果", async () => {
        const emitter = new FastEvent({
            executor: series()
        })
        const listeners = Array.from({ length: 10 }).map((_, index) => vi.fn(async () => {
            await new Promise(resolve => setTimeout(resolve, 50))
        }))

    })
})