import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../event"

describe("offAll和clear方法测试", () => {
    test("offAll应清除所有监听器", () => {
        const emitter = new FastEvent()
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        emitter.on("event1", listener1)
        emitter.on("event2", listener2)

        expect(emitter.listenerCount).toBe(2)
        emitter.offAll()
        expect(emitter.listenerCount).toBe(0)
        expect(listener1).not.toHaveBeenCalled()
        expect(listener2).not.toHaveBeenCalled()
    })

    test("clear应等同于offAll", () => {
        const emitter = new FastEvent()
        const listener = vi.fn()

        emitter.on("event", listener)
        expect(emitter.listenerCount).toBe(1)
        emitter.clear()
        expect(emitter.listenerCount).toBe(0)
    })

    test("offAll应清除指定前缀的监听器", () => {
        const emitter = new FastEvent()
        const listener1 = vi.fn()
        const listener2 = vi.fn()

        emitter.on("user/login", listener1)
        emitter.on("user/profile", listener1)
        emitter.on("system/start", listener2)

        expect(emitter.listenerCount).toBe(3)
        emitter.offAll("user")
        expect(emitter.listenerCount).toBe(1)
    })

    test("作用域的offAll应只清除该作用域的监听器", () => {
        const emitter = new FastEvent()
        const scope = emitter.scope("user")

        const globalListener = vi.fn()
        const scopeListener = vi.fn()

        emitter.on("global", globalListener)
        scope.on("login", scopeListener)

        expect(emitter.listenerCount).toBe(2)
        scope.offAll()
        expect(emitter.listenerCount).toBe(1)
    })

    test("嵌套作用域的offAll应只清除该作用域的监听器", () => {
        const emitter = new FastEvent()
        const userScope = emitter.scope("user")
        const profileScope = userScope.scope("profile")

        const listener1 = vi.fn()
        const listener2 = vi.fn()
        const listener3 = vi.fn()

        userScope.on("login", listener1)
        profileScope.on("update", listener2)
        emitter.on("system", listener3)

        expect(emitter.listenerCount).toBe(3)
        profileScope.offAll()
        expect(emitter.listenerCount).toBe(2)
        userScope.offAll()
        expect(emitter.listenerCount).toBe(1)
    })

    test("offAll应清除保留的事件", () => {
        const emitter = new FastEvent()
        emitter.emit("event1", "data1", true)
        emitter.emit("event2", "data2", true)

        expect(emitter.retainedMessages.size).toBe(2)
        emitter.offAll()
        expect(emitter.retainedMessages.size).toBe(0)
    })

    test("带前缀的offAll应只清除匹配的保留事件", () => {
        const emitter = new FastEvent()
        emitter.emit("user/login", "data1", true)
        emitter.emit("user/profile", "data2", true)
        emitter.emit("system/start", "data3", true)

        expect(emitter.retainedMessages.size).toBe(3)
        emitter.offAll("user")
        expect(emitter.retainedMessages.size).toBe(1)
    })
})