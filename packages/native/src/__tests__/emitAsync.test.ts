import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("异步发布与订阅", async () => {
    test("异步发布订阅事件", async () => {
        const emitter = new FastEvent()
        const events: any[] = []
        emitter.on("x", async ({ payload, type }) => {
            events.push({ type, payload })
        })
        await emitter.emitAsync("x", 1)
        expect(events[0].type).toBe("x")
        expect(events[0].payload).toBe(1)
    })
    test("异步发布订阅事件后取消", async () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const subscriber = emitter.on("x", async ({ type }) => {
            events.push(type)
        })
        await emitter.emitAsync("x", 1)
        expect(events).toEqual(["x"])
        subscriber.off()
        await emitter.emitAsync("x", 1)
        await emitter.emitAsync("x", 1)
        await emitter.emitAsync("x", 1)
        expect(events).toEqual(["x"])
    })
    test("发布订阅层级事件", async () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.on("a.b.c", async ({ type }) => {
            events.push(type)
        })
        await emitter.emitAsync("a", 1)
        await emitter.emitAsync("a.b", 1)
        await emitter.emitAsync("a.b.c", 1)
        expect(events).toEqual(["a.b.c"])
    })
    test("返回事件异步执行结果", async () => {
        const emitter = new FastEvent()
        for (let i = 1; i <= 10; i++) {
            emitter.on("x", async () => {
                return i
            })
        }
        const results = await emitter.emitAsync("x", 1)
        expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
    test("异步监听器执行出错返回事件执行结果", async () => {
        const emitter = new FastEvent()
        for (let i = 1; i <= 10; i++) {
            emitter.on("x", async () => {
                if (i % 2 === 0) throw new Error("custom")
                return i
            })
        }
        const results = await emitter.emitAsync("x", 1)
        for (let i = 1; i <= 10; i++) {
            if (i % 2 === 0) expect(results[i - 1]).toBeInstanceOf(Error)
            else expect(results[i - 1]).toBe(i)
        }
    })
})
