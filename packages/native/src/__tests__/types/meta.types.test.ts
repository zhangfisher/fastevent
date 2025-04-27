import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventMessage, ScopeEvents } from "../../types"
import { FastEventScopeMeta } from "../../scope"

describe("FastEvent元数据类型检查", () => {

    interface CustomEvents {
        x: number
        y: string
        z: boolean
    }
    interface CustomMeta {
        a: number
        b: string
        c: boolean
    }
    test("全局元数据类型", () => {
        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        type cases = [
            Expect<Equal<typeof emitter.options.meta, CustomMeta>>
        ]
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta>>
            ]
        })
        emitter.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta>>
            ]
        })

        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta>>
            ]
        })
    })
    test("自动推断全局元数据类型", () => {
        const emitter = new FastEvent({
            meta: {
                name: "FastEvent",
                price: 100,
                count: 3
            }
        })
        type OrderType = {
            name: string
            price: number
            count: number
        }
        type cases = [
            Expect<Equal<typeof emitter.options.meta, OrderType>>
        ]
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType>>
            ]
        })
        emitter.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType>>
            ]
        })

        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType>>
            ]
        })
    })
    test("Scope没有指定元数据时,默认使用全局元数据和Scope元数据", () => {
        // 如果没有指定元数据时，默认使用全局元数据
        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        const scope = emitter.scope("scope")
        type cases = [
            Expect<Equal<typeof scope.options.meta, CustomMeta & FastEventScopeMeta>>
        ]
        scope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
            ]
        })
        scope.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
            ]
        })

        scope.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
            ]
        })
    })
    test("Scope指定了额外的元数据", () => {
        // 如果没有指定元数据时，默认使用全局元数据
        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        const scope = emitter.scope("scope", {
            meta: {
                name: "FastEvent",
                price: 100,
                count: 3
            }
        })
        type OrderType = {
            name: string
            price: number
            count: number
        }
        type cases = [
            Expect<Equal<typeof scope.options.meta, OrderType & FastEventScopeMeta>>
        ]
        scope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType & FastEventScopeMeta>>
            ]
        })
        scope.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType & FastEventScopeMeta>>
            ]
        })

        scope.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType & FastEventScopeMeta>>
            ]
        })
    })

    test("嵌套Scope合并元数据", () => {
        // 如果没有指定元数据时，默认使用全局元数据
        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        const rootScope = emitter.scope("root", {
            meta: {
                name: "FastEvent",
                price: 100,
                count: 3
            }
        })
        type OrderType = {
            name: string
            price: number
            count: number
        }
        const childrenScope = rootScope.scope("children", {
            meta: {
                name: "John",
                vip: true,
                age: 18
            }
        })

        type UserType = {
            name: string
            vip: boolean,
            age: number
        }
        type FinalMeta = OrderType & UserType & FastEventScopeMeta

        type cases = [
            Expect<Equal<typeof rootScope.options.meta, OrderType & FastEventScopeMeta>>,
            Expect<Equal<typeof childrenScope.options.meta, OrderType & UserType & FastEventScopeMeta>>
        ]


        childrenScope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, FinalMeta>>
            ]
        })
        childrenScope.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, FinalMeta>>
            ]
        })

        childrenScope.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, FinalMeta>>
            ]
        })
    })
})

