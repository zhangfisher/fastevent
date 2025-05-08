/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScope, FastEventScopeMeta, FastEventScopeOptions } from "../../scope"
import { ChangeFieldType, FastEventMeta, FastEventOptions } from "../../types"



describe("继承FastEvent类型系统", () => {

    test("默认继承方式", () => {
        interface MyEventOptions extends FastEventOptions {
            count?: number
        }
        class MyEvent extends FastEvent {
            constructor(options?: Partial<MyEventOptions>) {
                super(Object.assign({}, options))
            }
            get options() {
                return super.options as unknown as Required<MyEventOptions>  //unknown as ChangeFieldType<Required<MyEventOptions>, 'context', never>
            }
        }
        const myemitter1 = new MyEvent()
        myemitter1.on('test', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, MyEvent>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })


        const myemitter2 = new MyEvent({
            context: { a: 1 }
        })
        myemitter2.on('test', function (this, message) {
            type cases = [
                // 没有指向{a:1}，因为没有传递泛型参数
                Expect<Equal<typeof this, MyEvent>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })
    })
    test("继承时重载覆盖Options", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        interface MyEventOptions<M, C> extends FastEventOptions<M, C> {
            count?: number
        }

        class MyEvent<E extends Record<string, any> = Record<string, any>,
            M extends Record<string, any> = Record<string, any>,
            C = never
        > extends FastEvent<E, M, C> {
            constructor(options?: Partial<MyEventOptions<M, C>>) {
                super(Object.assign({}, options))
            }
            get options() {
                return super.options as unknown as ChangeFieldType<Required<MyEventOptions<M, C>>, 'context', never>
            }
        }
        const emitter = new MyEvent({
            meta: {
                root: 100
            }
        })

        const myemitter1 = new MyEvent()
        myemitter1.on('test', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, MyEvent>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })


        const myemitter2 = new MyEvent({
            context: { a: 1 }
        })
        myemitter2.on('test', function (this, message) {
            type cases = [
                // 指向{a:1}，传递泛型参数
                Expect<Equal<typeof this, { a: number }>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })
    })
    test("继承时重载覆盖Options", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        interface MyScopeOptions extends FastEventScopeOptions {
            count?: number
        }


        const myemitter1 = new FastEvent()

        class MyScope extends FastEventScope {
            constructor(options?: Partial<MyScopeOptions>) {
                super(options)
            }
            get options() {
                return super.options //as unknown as ChangeFieldType<Required<MyScopeOptions>, 'context', never>
            }
        }
        const scope1 = new MyScope()
        scope1.bind(myemitter1, "test")
        scope1.on('test', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, MyScope>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })

    })

})


describe("继承FastEventScope类型系统", () => {

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

    test("继承作用域Scope类", () => {
        type MyScopeEvents = {
            a: number
            b: string
            c: boolean
        }
        interface MyScopeOptions extends FastEventScopeOptions {
            count?: number
        }


        const myemitter1 = new FastEvent()

        class MyScope extends FastEventScope {
            constructor(options?: Partial<MyScopeOptions>) {
                super(options)
            }
            get options() {
                return super.options //as unknown as ChangeFieldType<Required<MyScopeOptions>, 'context', never>
            }
        }
        const scope1 = new MyScope()
        scope1.bind(myemitter1, "test")
        scope1.on('test', function (this, message) {
            type cases = [
                Expect<Equal<typeof this, MyScope>>,
                Expect<Equal<typeof message.type, 'test'>>
            ]
        })

    })

})