import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("传递Meta数据", async () => {
    test("没有meta数据", () => {
        const emitter = new FastEvent()
        emitter.on("x", ({ payload, type, meta }, args) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            expect(meta).toBeUndefined()
            expect(args.meta).toBeUndefined()
        })
        emitter.emit("x", 1)
    })
    test("全局meta数据", () => {
        const emitter = new FastEvent({
            meta: { a: 1 }
        })
        emitter.on("x", ({ payload, type, meta }, args) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            expect(meta.a).toBe(1)
            expect(args.meta).toBeUndefined()
        })
        emitter.emit("x", 1)
    })
    test("emit时传递meta数据", () => {
        const emitter = new FastEvent({
            meta: { a: 1, b: 2 }
        })
        emitter.on("x", ({ payload, type, meta }, args) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            expect(meta.a).toBe(1)
            expect(meta.b).toBe(20)
            expect(meta.c).toBe(30)
            expect(args.meta).toEqual({ b: 20, c: 30 })
        })
        emitter.emit("x", 1, {
            meta: { b: 20, c: 30 }
        })
    })
}) 