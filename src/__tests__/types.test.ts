// eslint-disable no-unused-vars
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../event"
import { ScopeEvents } from "../types"


describe("Types", () => {
    test("Types tests", () => {
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

        emitter.on("a", (message) => {
            message.meta
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta>>
            ]
        })

        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>
            ]
        })

        emitter.onAny((message) => {
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


        emitter.on("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>
            ]
        })

        emitter.once("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>
            ]
        })

        emitter.once("b", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "b">>,
                Expect<Equal<typeof message.payload, number>>
            ]
        })
        emitter.emit("x/y/z", 1)

        emitter.on("x/y/z", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z">>,
                Expect<Equal<typeof message.payload, unknown>>
            ]
        })

        emitter.on("x/y/z/a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z/a">>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })
        emitter.waitFor("x/y/z/a").then((message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x/y/z/a">>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })



        // ----- scope -----

        const scope = emitter.scope("x/y/z")

        scope.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
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
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })

        scope.once("c", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "c">>,
                Expect<Equal<typeof message.payload, 3>>
            ]
        })



    })
})