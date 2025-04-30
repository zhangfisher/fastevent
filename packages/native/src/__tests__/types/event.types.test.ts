/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventMessage, PickScopeEvents, ScopeEvents } from "../../types"
import { FastEventScopeMeta } from "../../scope"
import { FastEventBus } from "../../eventbus"
import { E } from "vitest/dist/chunks/environment.d.Dmw5ulng.js"

describe("类型系统测试", () => {
    describe("作用域事件类型定义", () => {
        test("应正确提取指定前缀的事件类型", () => {
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
        })
    })

    describe("FastEvent基础类型检查", () => {
        interface CustomEvents {
            a: boolean
            b: number
            c: string,
            "x/y/z/a": 1
            "x/y/z/b": 2
            "x/y/z/c": 3
        }

        interface CustomMeta {
            a: number
            b: string
            c: boolean
        }

        type CustomMessage = FastEventMessage<CustomEvents, CustomMeta>
        const emitter = new FastEvent<CustomEvents, CustomMeta>()

        test("on方法应正确推导事件类型和元数据", () => {
            emitter.on("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.on("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.on("c", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "c">>,
                    Expect<Equal<typeof message.payload, string>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.on("xxx", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })
        })

        test("once方法应正确推导事件类型和元数据", () => {
            emitter.once("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.once("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.once("xxx", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })
        })

        test("onAny方法应正确处理通配符事件类型", () => {
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
        })

        test("emit方法应正确验证事件类型和载荷", () => {
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

        test("waitFor方法应正确推导异步事件类型", () => {
            emitter.waitFor("a").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.waitFor("b").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'b'>>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.waitFor("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })

            emitter.waitFor<boolean>("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
                ]
            })
        })
    })

    describe("FastEvent默认类型行为", () => {
        const emitter = new FastEvent()

        test("on方法在未指定类型时应使用默认类型", () => {
            emitter.on("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any>>>
                ]
            })

            emitter.on("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any>>>
                ]
            })
        })

        test("once方法在未指定类型时应使用默认类型", () => {
            emitter.once("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any>>>
                ]
            })

            emitter.once("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any>>>
                ]
            })
        })

        test("onAny方法在未指定类型时应使用默认类型", () => {
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
        })

        test("emit方法在未指定类型时应接受任意类型载荷", () => {
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
    })

    describe("作用域类型系统", () => {
        interface CustomEvents {
            a: boolean
            b: number
            c: string,
            "x/y/z/a": 1
            "x/y/z/b": 2
            "x/y/z/c": 3
        }

        interface CustomMeta {
            a: number
            b: string
            c: boolean
        }

        const emitter = new FastEvent<CustomEvents, CustomMeta>()
        const scope = emitter.scope("x/y/z")

        test("作用域应正确继承和扩展元数据类型", () => {
            typeof scope.options.meta
            type metaCases = [
                Expect<Equal<typeof scope.options.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>,
            ]
        })

        test("作用域的on方法应正确推导事件类型", () => {
            scope.on("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, 1>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })

            scope.on("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, 2>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })
        })

        test("作用域的once方法应正确推导事件类型", () => {
            scope.once("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, 1>>
                ]
            })
            scope.once("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'b'>>,
                    Expect<Equal<typeof message.payload, 2>>
                ]
            })
            scope.once("c", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'c'>>,
                    Expect<Equal<typeof message.payload, 3>>
                ]
            })
        })

        test("作用域的waitFor方法应正确推导异步事件类型", () => {
            scope.waitFor("a").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, 1>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })

            scope.waitFor("b").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'b'>>,
                    Expect<Equal<typeof message.payload, 2>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })

            scope.waitFor("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'xxxx'>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })

            scope.waitFor<boolean>("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta & Record<string, any>>>
                ]
            })
        })
    })

})



describe("作用域事件类型检查", () => {

    interface CustomEvents {
        x: number
        y: string
        z: boolean
        'a/b/x': 1
        'a/b/y': 2
        'a/b/z': 3
    }
    test("Scope根据前缀从全局事件类型推断Scope事件", () => {
        // 如果没有指定元数据时，默认使用全局元数据
        const emitter = new FastEvent<CustomEvents>()
        const scope = emitter.scope("a/b")
        scope.types
        scope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })
        scope.once("y", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'y'>>,
                Expect<Equal<typeof message.payload, 2>>
            ]
        })
        scope.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>
            ]
        })
    })
    test("Scope自定义事件类型与全局事件类型合并", () => {
        type ScopeCustomEvents = {
            m: number,
            n: boolean
        }
        const emitter = new FastEvent<CustomEvents>()
        // ❌ 无法从全局事件中推导出scope事件类型
        // const scope = emitter.scope<ScopeCustomEvents>("a/b")
        //✅ 当为scope指定事件前缀类型时，才从全局事件中推导出scope事件类型
        const scope = emitter.scope<ScopeCustomEvents, 'a/b'>("a/b")
        scope.types
        // 从全局事件中推导出来的
        scope.on("x", (message) => {
            type cases = [
                // 从全局继承的事件无法推导事件类型
                Expect<Equal<typeof message.type, 'x'>>,
                Expect<Equal<typeof message.payload, 1>>
            ]
        })
        scope.once("y", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'y'>>,
                Expect<Equal<typeof message.payload, 2>>
            ]
        })
        // 仅限scope事件
        scope.on('m', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'm'>>,
                Expect<Equal<typeof message.payload, number>>
            ]
        })
        scope.once('n', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'n'>>,
                Expect<Equal<typeof message.payload, boolean>>
            ]
        })
        scope.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>
            ]
        })
    })



    test("嵌套Scope合并元数据", () => {

        type RootEvents = {
            'root/x': 100,
            'root/children/x': 200,
            'root/children/grandsond/x': 300
        }

        // 如果没有指定元数据时，默认使用全局元数据
        const emitter = new FastEvent<RootEvents>()
        type RootScopeEvents = { root: string }
        type ChildScopeEvents = { children: string }
        type GrandsondDScopeEvents = { grandson: number }

        const rootScope = emitter.scope<RootScopeEvents, 'root'>("root")
        const childrenScope = rootScope.scope<ChildScopeEvents, 'children'>("children")
        const GrandsondScope = rootScope.scope<ChildScopeEvents, 'grandsond'>("grandsond")

        type cases = [
            Expect<Equal<typeof rootScope.types, PickScopeEvents<RootEvents, "root"> & RootScopeEvents>>,
            Expect<Equal<typeof childrenScope.types, CustomMeta & OrderType & UserType & FastEventScopeMeta>>,
            Expect<Equal<typeof GrandsondScope.types, CustomMeta & OrderType & UserType & FastEventScopeMeta>>
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

