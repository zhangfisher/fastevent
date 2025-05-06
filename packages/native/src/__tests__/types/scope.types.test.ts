/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScope, FastEventScopeMeta } from "../../scope"
import { FastEventMeta, FastEvents, PickScopeEvents } from "../../types"

declare module "../../types" {
    interface FastEventMeta {
        x: number
    }
}


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
            message.meta
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
                Expect<Equal<typeof message.meta.x, number>>,
            ]
        })


    })
    test("scope事件类型测试", () => {
        type CustomScopeEvents = {
            x: number,
            y: string
        }
        const scope = emitter.scope<CustomScopeEvents>("a/b/c")

        type ScopeEvents = Expect<Equal<typeof scope.events, PickScopeEvents<Record<string, any> & FastEvents, string> & CustomScopeEvents>>

        scope.on('x', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, FastEventMeta & FastEventScopeMeta & Record<string, any>>>
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
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })

        scope.once("a", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
    })

    test("继承作用域类", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        const emitter = new FastEvent({
            meta: {
                root: 100
            }
        })
        class MyScope extends FastEventScope<MyScopeEvents> {
            test(value: number) {
                this.options.meta.root = "value"
                return 100

            }
        }

        const myScope = emitter.scope('modules/my', new MyScope())

        type cases = [
            Expect<Equal<Parameters<typeof myScope.test>[0], number>>
        ]

        myScope.test(1)

        myScope.on('a', (message) => {
            message.meta.root = "1"
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, number>>,
                // 无法从Emitter继承推断出全局Meta
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
        myScope.on('b', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'b'>>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
    })
    test("继承作用域类增加自定义元数据", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        const emitter = new FastEvent({
            meta: {
                root: 100
            }
        })

        type Meta = Expect<Equal<typeof emitter.meta, { root: number }>>

        type MyScopeMeta = {
            x: number
            y: string
            z: boolean
        }
        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {
            test(value: number) {
                return 100

            }
        }

        // 无法从Emitter继承推断出全局Meta
        const myScope = emitter.scope('modules/my', new MyScope())

        type cases = [
            Expect<Equal<Parameters<typeof myScope.test>[0], number>>
        ]

        myScope.test(1)

        myScope.on('a', (message) => {
            message.meta.root = "1"
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, number>>,
                // 无法从Emitter继承推断出全局Meta
                Expect<Equal<typeof message.meta, MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
        myScope.on('b', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'b'>>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
    })
    test("嵌套Scope类自定义元数据", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        const emitter = new FastEvent({
            meta: {
                root: 100
            }
        })

        type Meta = Expect<Equal<typeof emitter.meta, { root: number }>>

        type MyScopeMeta = {
            x: number
            y: string
            z: boolean
        }
        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {
            test(value: number) {
                return 100

            }
        }

        // 无法从Emitter继承推断出全局Meta
        const myScope = emitter.scope('modules/my', new MyScope())

        type cases = [
            Expect<Equal<Parameters<typeof myScope.test>[0], number>>
        ]

        myScope.test(1)

        myScope.on('a', (message) => {
            message.meta.root = "1"
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, number>>,
                // 无法从Emitter继承推断出全局Meta
                Expect<Equal<typeof message.meta, MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
        myScope.on('b', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'b'>>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta>>
            ]
        })
    })
})


