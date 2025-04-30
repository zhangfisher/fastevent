/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScopeMeta } from "../../scope"
import { FastEvents } from "../../types"

describe("事件作用域类型测试", () => {


    type CustomEvents = {
        a: boolean
        b: number
        c: string
    }
    const emitter = new FastEvent();
    test("scope事件类型测试", () => {

        const scope = emitter.scope<{
            x: number,
            y: string
        }>("a/b/c")

        scope.on('x', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, Record<string, any> & FastEventScopeMeta>>,
            ]
        })


    })
})

describe("作用域上下文类型系统", () => {
    test("未指定上下文时应使用默认上下文类型", () => {
        const withoutCtxEmitter = new FastEvent()
        type Ctx1 = Expect<Equal<typeof withoutCtxEmitter.options.context, never>>

        withoutCtxEmitter.on("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, FastEvent>>
            ]
        })

        withoutCtxEmitter.once("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, FastEvent>>
            ]
        })
    })

    test("指定上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true
            }
        })
        type Ctx = Expect<Equal<typeof emitter.options.context, { root: boolean }>>

        emitter.on("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, { root: boolean }>>
            ]
        })

        emitter.once("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, { root: boolean }>>
            ]
        })
    })

    test("作用域继承上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true
            }
        })
        const withoutCtxScope = emitter.scope("x/y/z")
        type withoutScopeCtx = Expect<Equal<typeof withoutCtxScope.options.context, { root: boolean }>>

        withoutCtxScope.on("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, { root: boolean }>>
            ]
        })

        withoutCtxScope.once("xxx", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, { root: boolean }>>
            ]
        })
    })

    test("作用域自定义上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true
            }
        })
        const scope = emitter.scope("x/y/z", {
            context: 1
        })
        type scopeCtx = Expect<Equal<typeof scope.options.context, number>>

        scope.on("a", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, Record<string, any> & FastEventScopeMeta>>
            ]
        })

        scope.once("a", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, Record<string, any> & FastEventScopeMeta>>
            ]
        })
    })
})




// const listener = (({ type }) => {
//     anyEvents.push(type)
// }) as FastEventListener

// emitter.onAny(listener)


// const dScope = scope.scope("d") // a/b/c/d
// dScope.onAny(listener)

// const eScope = scope.scope("e")// a/b/c/e
// eScope.onAny(listener)

// const fScope = scope.scope("f")// a/b/c/f
// fScope.onAny(listener)

// const anyEvents: string[] = []
// emitter.emit("root", 1)
// scope.emit("c", 1)
// dScope.emit("d", 1)
// eScope.emit("e", 1)
// fScope.emit("f", 1)
