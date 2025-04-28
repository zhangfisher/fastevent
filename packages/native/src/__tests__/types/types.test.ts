import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventMessage, ScopeEvents } from "../../types"
import { FastEventScopeMeta } from "../../scope"

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
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.on("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.on("c", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "c">>,
                    Expect<Equal<typeof message.payload, string>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.on("xxx", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })
        })

        test("once方法应正确推导事件类型和元数据", () => {
            emitter.once("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.once("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.once("xxx", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
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
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.waitFor("b").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'b'>>,
                    Expect<Equal<typeof message.payload, number>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.waitFor("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, keyof CustomEvents>>,
                    Expect<Equal<typeof message.payload, CustomEvents[keyof CustomEvents]>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
                ]
            })

            emitter.waitFor<boolean>("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta>>
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
            type metaCases = [
                Expect<Equal<typeof scope.options.meta, CustomMeta & FastEventScopeMeta>>,
            ]
        })

        test("作用域的on方法应正确推导事件类型", () => {
            scope.on("a", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'a'>>,
                    Expect<Equal<typeof message.payload, 1>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
                ]
            })

            scope.on("b", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, 2>>
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
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
                ]
            })

            scope.waitFor("b").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, 'b'>>,
                    Expect<Equal<typeof message.payload, 2>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
                ]
            })

            scope.waitFor("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
                ]
            })

            scope.waitFor<boolean>("xxxx").then((message) => {
                type cases = [
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, boolean>>,
                    Expect<Equal<typeof message.meta, CustomMeta & FastEventScopeMeta>>
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
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any> & FastEventScopeMeta>>
                ]
            })

            scope.once("a", function (this, message) {
                type cases = [
                    Expect<Equal<typeof this, number>>,
                    Expect<Equal<typeof message.type, string>>,
                    Expect<Equal<typeof message.payload, any>>,
                    Expect<Equal<typeof message.meta, Record<string, any> & FastEventScopeMeta>>
                ]
            })
        })
    })
})
function demo() {

    interface MyEvents {
        'user/login': { id: number; name: string };
        'user/logout': { id: number };
        'system/error': { code: string; message: string };
    }

    const events = new FastEvent<MyEvents>();

    events.on("user/login")

    events.onAny<number>((message) => {
        if (message.type === "1111") {

        }
        message.type = "user/login"
        message.payload
    })

    // ✅ 正确：数据类型匹配
    events.emit('user/login', { id: 1, name: 'Alice' });
    // ✅ 正确：消息对象
    events.emit({
        type: 'user/login',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发未定义的事件类型
    events.emit({
        type: 'xxxxx',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发 未定义的事件类型
    events.emit('xxxx', 1);


    // ❌ 错误：已声明事件类型payload不匹配
    events.emit('user/login', { id: "1", name: 'Alice' }); // TypeScript 错误
    // ❌ 错误：id类型不匹配
    events.emit({
        type: 'user/login',
        payload: { id: "1", name: 'Alice' }
    });


    const scope = events.scope('user')

    // ✅ 正确：数据类型匹配
    scope.emit('user/login', { id: 1, name: 'Alice' });
    // ✅ 正确：支持触发 未定义的事件类型
    scope.emit('xxxx', 1);
    // ✅ 正确：消息对象
    scope.emit({
        type: 'login',
        payload: { id: 1, name: 'Alice' }
    });
    // ✅ 正确：支持触发未定义的事件类型
    scope.emit({
        type: 'xxxxx',
        payload: { id: 1, name: 'Alice' }
    });



    // ❌ 错误：已声明事件类型payload不匹配
    scope.emit('login', { id: "1", name: 'Alice' }); // TypeScript 错误
    // ❌ 错误：id类型不匹配
    scope.emit({
        type: 'login',
        payload: { id: "1", name: 'Alice' }
    });
}