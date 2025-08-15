import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("只订阅一次的事件的发布与订阅", async () => {
    test("简单发布只订阅一次事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.once("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        expect(events).toEqual(["x"])
    })
    test("简单发布只订阅一次事件后取消", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const subscriber = emitter.once("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            events.push(type)
        })
        subscriber.off()
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        expect(events).toEqual([])
    })
    test("简单发布只订阅一次的多级事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.once("a.b.c.d", ({ payload, type }) => {
            expect(type).toBe("a.b.c.d")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.emit("a.b.c.d", 1)
        emitter.emit("a.b.c.d", 2)
        emitter.emit("a.b.c.d", 3)
        emitter.emit("a.b.c.d", 4)
        expect(events).toEqual(["a.b.c.d"])
    })
    test("混合发布只订阅一次的多级事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const values: number[] = []
        emitter.once("a.b.c.d", ({ payload, type }) => {
            expect(type).toBe("a.b.c.d")
            values.push(payload)
            events.push(type)
        })
        emitter.on("a.b.c.d", ({ payload, type }) => {
            expect(type).toBe("a.b.c.d")
            values.push(payload)
            events.push(type)
        })
        emitter.emit("a.b.c.d", 1)
        emitter.emit("a.b.c.d", 2)
        emitter.emit("a.b.c.d", 3)
        emitter.emit("a.b.c.d", 4)
        expect(events).toEqual(["a.b.c.d", "a.b.c.d", "a.b.c.d", "a.b.c.d", "a.b.c.d"])
        expect(values).toEqual([1, 1, 2, 3, 4])
    })

    test("多个只订阅一次事件监听器均应该正确销毁", () => {
        const emitter = new FastEvent()
        const events: number[] = []

        emitter.once("x", () => { events.push(1) })
        emitter.once("x", () => { events.push(2) })
        emitter.once("x", () => { events.push(3) })
        emitter.once("x", () => { events.push(4) })
        emitter.once("x", () => { events.push(5) })

        emitter.emit("x", 1)
        expect(events).toEqual([1, 2, 3, 4, 5])

        const listeners = emitter.getListeners("x")
        expect(listeners.length).toBe(0)
    })
    test("在once侦听器里面再次触发时，侦听器只执行一次", () => {
        const emitter = new FastEvent()
        const values: number[] = []
        return new Promise<void>((resolve) => {
            emitter.once(`x`, (event) => {
                values.push(event.payload)
                emitter.emit("x", 1)
                emitter.emit("x", 2)
                emitter.emit("x", 3)
                emitter.emit("x", 4)
                resolve()
                expect(values.length).toBe(1)
            })
            emitter.emit("x", 0)
            
        })
    })


})
