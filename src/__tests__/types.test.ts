// eslint-disable no-unused-vars
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../event"
import { FastEventMessage, ScopeEvents } from "../types"


describe("Types", () => {
    test("event types tests", () => {
        interface CustomEvents {
            a: boolean
            b: number
            c: string,
            "x/y/z/a": 1
            "x/y/z/b": 2
            "x/y/z/c": 3
        }

        type ScopeCustomEvents = ScopeEvents<CustomEvents, 'x/y/z'>

        type cases = [
            Expect<Equal<ScopeCustomEvents, {
                a: 1
                b: 2
                c: 3
            }>>
        ]

        interface CustomMeta {
            a: number
            b: string
            c: boolean
        }

        type CustomMessage = FastEventMessage<CustomEvents, CustomMeta>


        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        // ------------------ on ------------------
        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, boolean>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.on("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.on("c", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "c">>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.on("x/y/z/a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z/a">>,
                Expect<Equal<typeof message.payload, 1>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.on("x/y/z/b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z/b">>,
                Expect<Equal<typeof message.payload, 2>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.on("x/y/z/c", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z/c">>,
                Expect<Equal<typeof message.payload, 3>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        // 字符串类型不在CustomEvents中声明,message.type为string类型
        emitter.on("xxx", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, keyof CustomEvents>>,
                Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        // --------------------- once ------------------
        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, boolean>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        emitter.once("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        // 字符串类型不在CustomEvents中声明,message.type为string类型
        emitter.once("xxx", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, keyof CustomEvents>>,
                Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                Expect<Equal<typeof message.meta, CustomMeta | undefined>>
            ]
        })
        // ------------------ onAny ------------------
        emitter.onAny((message) => {
            message.type = "xxx"
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>
            ]
        })
        emitter.onAny<number>((message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, number>>
            ]
        })
        // ------------------ emit ------------------
        type emitCases = [

        ]

        emitter.emit("a", true)
        emitter.emit("b", 100)
        emitter.emit("c", "hello")
        emitter.emit("x/y/z/a", 1)
        emitter.emit("x/y/z/b", 2)
        emitter.emit("x/y/z/c", 3)
        emitter.emit("xxx", 100)
        emitter.emit("xxx", "hello")
        emitter.emit("xxx", true)
        emitter.emit("xxx", false)





    })
    test("event types tests without event types", () => {

        const emitter = new FastEvent()
        // ------------------ on ------------------
        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, boolean>>,
                Expect<Equal<typeof message.meta, unknown>>
            ]
        })
        emitter.on("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, unknown>>
            ]
        })
        // --------------------- once ------------------
        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, boolean>>,
                Expect<Equal<typeof message.meta, unknown>>
            ]
        })
        emitter.once("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, unknown>>
            ]
        })
        // ------------------ onAny ------------------
        emitter.onAny((message) => {
            message.type = "xxx"
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>
            ]
        })
        emitter.onAny<number>((message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, number>>
            ]
        })
        // ------------------ emit ------------------
        emitter.emit("a", true)
        emitter.emit("b", 100)
        emitter.emit("c", "hello")
        emitter.emit("x/y/z/a", 1)
        emitter.emit("x/y/z/b", 2)
        emitter.emit("x/y/z/c", 3)
        emitter.emit("xxx", 100)
        emitter.emit("xxx", "hello")
        emitter.emit("xxx", true)
        emitter.emit("xxx", false)
    })
    test("scope event types tests", () => {

        interface CustomEvents {
            a: boolean
            b: number
            c: string,
            "x/y/z/a": 1
            "x/y/z/b": 2
            "x/y/z/c": 3
        }

        type ScopeCustomEvents = ScopeEvents<CustomEvents, 'x/y/z'>

        type cases = [
            Expect<Equal<ScopeCustomEvents, {
                a: 1
                b: 2
                c: 3
            }>>
        ]

        interface CustomMeta {
            a: number
            b: string
            c: boolean
        }


        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        // ----- scope -----

        const scope = emitter.scope("x/y/z")

        scope.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, keyof CustomEvents>>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })

        scope.on("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, 2>>
            ]
        })

        scope.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, keyof CustomEvents>>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })

        scope.once("c", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, keyof CustomEvents>>,
                Expect<Equal<typeof message.payload, 3>>
            ]
        })


    })
})