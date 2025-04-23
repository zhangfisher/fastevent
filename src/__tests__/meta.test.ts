import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("传递Meta数据", async () => {
    test("全局meta数据", () => {
        const emitter = new FastEvent({
            meta: { a: 1 }
        })
        emitter.on("x", ({ payload, type, meta }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            expect(meta.a).toBe(1)
        })
        emitter.emit("x", 1)
    })
    test("emit时传递meta数据", () => {
        const emitter = new FastEvent({
            meta: { a: 1, b: 2 }
        })
        emitter.on("x", ({ payload, type, meta }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            expect(meta.a).toBe(10)
            expect(meta.b).toBe(20)
        })
        emitter.emit("x", 1, false, { a: 10, b: 20 })
    })
}) 