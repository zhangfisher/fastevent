import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../event"



describe("订阅与发布retain事件", async () => {
    test("简单发布订阅retain事件", () => {
        const emitter = new FastEvent()
        emitter.emit("x", 1, { retain: true })
        emitter.on("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
        })
        emitter.emit("a.b.c1", 1, { retain: true })
        emitter.emit("a.b.c2", 2, { retain: true })
        emitter.on("a.b.c1", ({ payload, type }) => {
            expect(type).toBe("a.b.c1")
            expect(payload).toBe(1)
        })
        emitter.on("a.b.c2", ({ payload, type }) => {
            expect(type).toBe("a.b.c2")
            expect(payload).toBe(2)
        })
    })
    test("取消retain事件", () => {
        const emitter = new FastEvent()
        emitter.emit("x", 1, true)
        emitter.on("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
        })
        emitter.emit("x") // 取消保留事件
        // 以下事件不会触发
        const listener = vi.fn()
        emitter.on("x", listener)
        expect(listener).not.toHaveBeenCalled()
    })

    test("不处理通配符的retain事件", () => {
        const emitter = new FastEvent()
        emitter.emit("a.b.c1", 1, { retain: true })
        emitter.emit("a.b.c2", 2, { retain: true })
        const events: string[] = []
        // 订阅所有a.b.*事件,由于c1,c2是
        emitter.on("a.b.*", ({ type }) => {
            events.push(type)
        })
        expect(events).toEqual([])
    })
    test("简单发布订阅retain事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.emit("a", 1, { retain: true })
        emitter.emit("a.b", 2, { retain: true })
        emitter.emit("a.b.c", 3, { retain: true })
        emitter.emit("a.b.c.d", 4, { retain: true })

        emitter.on("a", ({ payload, type }) => {
            expect(type).toBe("a")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.on("a.b", ({ payload, type }) => {
            expect(type).toBe("a.b")
            expect(payload).toBe(2)
            events.push(type)
        })
        emitter.on("a.b.c", ({ payload, type }) => {
            expect(type).toBe("a.b.c")
            expect(payload).toBe(3)
            events.push(type)
        })
        emitter.on("a.b.c.d", ({ payload, type }) => {
            expect(type).toBe("a.b.c.d")
            expect(payload).toBe(4)
            events.push(type)
        })
        expect(events).toEqual(["a", "a.b", "a.b.c", "a.b.c.d"])
    })



    test("使用retain=true参数简单发布订阅retain事件", () => {
        const emitter = new FastEvent()
        emitter.emit("x", 1, true)
        emitter.on("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
        })
        emitter.emit("a.b.c1", 1, true)
        emitter.emit("a.b.c2", 2, true)
        emitter.on("a.b.c1", ({ payload, type }) => {
            expect(type).toBe("a.b.c1")
            expect(payload).toBe(1)
        })
        emitter.on("a.b.c2", ({ payload, type }) => {
            expect(type).toBe("a.b.c2")
            expect(payload).toBe(2)
        })
    })
    test("使用retain=true参数不处理通配符的retain事件", () => {
        const emitter = new FastEvent()
        emitter.emit("a.b.c1", 1, true)
        emitter.emit("a.b.c2", 2, true)
        const events: string[] = []
        // 订阅所有a.b.*事件,由于c1,c2是
        emitter.on("a.b.*", ({ type }) => {
            events.push(type)
        })
        expect(events).toEqual([])
    })
    test("使用retain=true参数简单发布订阅retain事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.emit("a", 1, true)
        emitter.emit("a.b", 2, true)
        emitter.emit("a.b.c", 3, true)
        emitter.emit("a.b.c.d", 4, true)

        emitter.on("a", ({ payload, type }) => {
            expect(type).toBe("a")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.on("a.b", ({ payload, type }) => {
            expect(type).toBe("a.b")
            expect(payload).toBe(2)
            events.push(type)
        })
        emitter.on("a.b.c", ({ payload, type }) => {
            expect(type).toBe("a.b.c")
            expect(payload).toBe(3)
            events.push(type)
        })
        emitter.on("a.b.c.d", ({ payload, type }) => {
            expect(type).toBe("a.b.c.d")
            expect(payload).toBe(4)
            events.push(type)
        })
        expect(events).toEqual(["a", "a.b", "a.b.c", "a.b.c.d"])
    })
})
