import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventListener } from '../types';


describe("退订事件", () => {
    test("基本退订事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const subscriber = emitter.on("x", ({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.emit("x", 1)
        subscriber.off()
        emitter.emit("x", 1)
        expect(events).toEqual(["x"])
    })
    test("根据事件类型和侦听器进行退订", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = (({ payload, type }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.on("x", listener)
        emitter.emit("x", 1)
        emitter.off("x", listener)
        emitter.emit("x", 1)
        expect(events).toEqual(["x"])
    })
    test("多级事件根据事件类型和侦听器进行退订", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = (({ payload, type }) => {
            expect(type).toBe("a/b/c/d")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.on("a/b/c/d", listener)
        emitter.emit("a/b/c/d", 1)
        emitter.off("a/b/c/d", listener) //
        emitter.emit("a/b/c/d", 1)
        emitter.emit("a/b/c/d", 2)
        emitter.emit("a/b/c/d", 3)
        expect(events).toEqual(["a/b/c/d"])
    })

    test("通配符事件退订", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            expect(type).toBe("a/b/c/d")
            expect(payload).toBe(1)
            events.push(type)
        }
        emitter.on("a/b/c/*", listener)
        emitter.emit("a/b/c/d", 1)
        emitter.off("a/b/c/*", listener) //
        emitter.emit("a/b/c/d", 1)
        emitter.emit("a/b/c/d", 2)
        emitter.emit("a/b/c/d", 3)
        expect(events).toEqual(["a/b/c/d"])
    })

    test("退订指定的侦听器", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            expect(type).toBe("a/b/c/d")
            expect(payload).toBe(1)
            events.push(type)
        }
        emitter.on("a/b/c/*", listener)
        emitter.on("a/b/*/*", listener)
        emitter.on("a/*/*/*", listener)
        emitter.on("*/*/*/*", listener)
        emitter.emit("a/b/c/d", 1)
        emitter.off(listener)
        emitter.emit("a/b/c/d", 1)
        emitter.emit("a/b/c/d", 2)
        emitter.emit("a/b/c/d", 3)
        emitter.emit("a/b/c/d", 4)
        expect(events).toEqual(["a/b/c/d", "a/b/c/d", "a/b/c/d", "a/b/c/d"])
    })
    test("退订指定的事件时不指定侦听器", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            events.push(type)
        }
        emitter.on("a", listener)
        emitter.on("b", listener)
        emitter.on("c", listener)
        emitter.on("d", listener)
        emitter.emit("a", 1)
        emitter.emit("a", 1)
        emitter.off("a")
        emitter.emit("a", 1)
        emitter.emit("a", 1)
        emitter.emit("a", 1)
        emitter.emit("b", 2)
        emitter.emit("c", 3)
        emitter.emit("d", 4)
        expect(events).toEqual(["a", "a", "b", "c", "d"])
    })
    test("退订所有侦听器", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            events.push(type)
        }
        emitter.on("a", listener)
        emitter.on("b", listener)
        emitter.on("c", listener)
        emitter.on("d", listener)
        emitter.emit("a", 1)
        emitter.emit("b", 1)
        emitter.emit("c", 1)
        emitter.emit("d", 1)
        emitter.offAll()
        emitter.emit("a", 1)
        emitter.emit("a", 1)
        emitter.emit("b", 1)
        emitter.emit("b", 1)
        emitter.emit("c", 1)
        emitter.emit("c", 1)
        emitter.emit("d", 1)
        emitter.emit("d", 1)
        expect(events).toEqual(["a", "b", "c", "d"])
    })
    test("退订含通配符的事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            events.push(type)
        }
        emitter.on("a", listener)
        emitter.on("b", listener)
        emitter.on("c", listener)
        emitter.on("d", listener)
        emitter.emit("a", 1)
        emitter.emit("b", 1)
        emitter.emit("c", 1)
        emitter.emit("d", 1)
        emitter.off("*")
        emitter.emit("a", 1)
        emitter.emit("a", 1)
        emitter.emit("b", 1)
        emitter.emit("b", 1)
        emitter.emit("c", 1)
        emitter.emit("c", 1)
        emitter.emit("d", 1)
        emitter.emit("d", 1)
        expect(events).toEqual(["a", "b", "c", "d"])
    })
    test("退订含通配符的事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            events.push(type)
        }
        emitter.on("a/*", listener)
        emitter.on("b/*", listener)
        emitter.on("c/*", listener)
        emitter.on("d/*", listener)
        emitter.emit("a/1", 1)
        emitter.emit("b/2", 1)
        emitter.emit("c/3", 1)
        emitter.emit("d/4", 1)
        emitter.off("a/*")
        emitter.off("b/*")
        emitter.emit("a/1", 2)
        emitter.emit("b/2", 2)
        emitter.emit("c/3", 2)
        emitter.emit("d/4", 2)
        expect(events).toEqual(["a/1", "b/2", "c/3", "d/4", "c/3", "d/4"])
    })
    test("退订多层含通配符的事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const listener: FastEventListener<string, number> = ({ payload, type }) => {
            events.push(type)
        }
        emitter.on("a/*", listener)
        emitter.on("a/b/*", listener)
        emitter.on("a/b/c/*", listener)
        emitter.on("a/b/c/d/*", listener)
        emitter.on("a/b/c/d/e/*", listener)

        emitter.emit("a/1", 1)
        emitter.emit("a/b/2", 1)
        emitter.emit("a/b/c/3", 1)
        emitter.emit("a/b/c/d/4", 1)
        emitter.emit("a/b/c/d/e/5", 1)

        emitter.off("a/**")
        emitter.emit("a/1", 1)
        emitter.emit("a/b/2", 1)
        emitter.emit("a/b/c/3", 1)
        emitter.emit("a/b/c/d/4", 1)
        emitter.emit("a/b/c/d/e/5", 1)
        emitter.emit("a/1", 1)
        emitter.emit("a/b/2", 1)
        emitter.emit("a/b/c/3", 1)
        emitter.emit("a/b/c/d/4", 1)
        emitter.emit("a/b/c/d/e/5", 1)

        expect(events).toEqual(["a/1", "a/b/2", "a/b/c/3", "a/b/c/d/4", "a/b/c/d/e/5"])
    })
})

