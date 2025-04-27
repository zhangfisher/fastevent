import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventListener } from '../types';


describe("scope", () => {
    test("scope简单的发布订阅事件", () => {
        const emitter = new FastEvent()
        const scope = emitter.scope("a/b/c")
        const events: string[] = []
        scope.on("x", ({ type }) => {
            events.push(type)
        })
        emitter.on("a/b/c/x", ({ type }) => {
            events.push(type)
        })
        scope.emit("x", 1)
        expect(events).toEqual(["x", "a/b/c/x"])
    })

    describe("scope emitAsync", () => {
        test("基本的异步事件触发", async () => {
            const emitter = new FastEvent()
            const scope = emitter.scope("a/b/c")
            const events: string[] = []
            scope.on("x", async ({ type }) => {
                events.push(type)
                return "result1"
            })
            emitter.on("a/b/c/x", async ({ type }) => {
                events.push(type)
                return "result2"
            })
            const results = await scope.emitAsync("x", 1)
            expect(events).toEqual(["x", "a/b/c/x"])
            expect(results).toEqual(["result1", "result2"])
        })

        test("异步事件错误处理", async () => {
            const emitter = new FastEvent()
            const scope = emitter.scope("a/b/c")

            scope.on("x", async () => {
                throw new Error("error1")
            })
            emitter.on("a/b/c/x", async () => {
                throw new Error("error2")
            })

            const results = await scope.emitAsync("x", 1) as unknown as Error[]
            expect(results[0]).toBeInstanceOf(Error)
            expect(results[1]).toBeInstanceOf(Error)
            expect(results[0].message).toBe("error1")
            expect(results[1].message).toBe("error2")
        })

        test("作用域meta数据合并", async () => {
            const emitter = new FastEvent({
                meta: { root: 1 }
            })
            const scope = emitter.scope("a/b/c", {
                meta: { scope: 1 }
            })

            let receivedMeta: any
            scope.on("x", async ({ meta }) => {
                receivedMeta = meta
                return "ok"
            })

            await scope.emitAsync("x", 1, { retain: false, meta: { event: 1 } })
            expect(receivedMeta).toEqual({
                root: 1,
                scope: 1,
                event: 1
            })
        })

        test("多层作用域异步事件传播", async () => {
            const emitter = new FastEvent()
            const scope1 = emitter.scope("a")
            const scope2 = scope1.scope("b")
            const scope3 = scope2.scope("c")

            const events: string[] = []
            const addEvent = (prefix: string) => async ({ type }: any) => {
                events.push(`${prefix}:${type}`)
                return prefix
            }

            emitter.on("a/b/c/x", addEvent("root"))
            scope1.on("b/c/x", addEvent("scope1"))
            scope2.on("c/x", addEvent("scope2"))
            scope3.on("x", addEvent("scope3"))

            const results = await scope3.emitAsync("x", 1);

            expect(events).toEqual([
                "root:a/b/c/x",
                "scope1:b/c/x",
                "scope2:c/x",
                "scope3:x",
            ])
            expect(results).toEqual([
                "root",
                "scope1",
                "scope2",
                "scope3",
            ])
        })
    })
    test("scope通过off简单的退订事件", () => {
        const emitter = new FastEvent()
        const scope = emitter.scope("a/b/c")

        const events: string[] = []
        const subscriber = scope.on("x", ({ type }) => {
            events.push(type)
        })
        emitter.on("a/b/c/x", ({ type }) => {
            events.push(type)
        })
        scope.emit("x", 1)
        subscriber.off()
        scope.emit("x", 1)
        expect(events).toEqual(["x", "a/b/c/x", "a/b/c/x"])
    })

    test("scope off退订事件", () => {
        const emitter = new FastEvent()
        const scope = emitter.scope("a/b/c")

        const events: string[] = []
        scope.on("x", ({ type }) => {
            events.push(type)
        })
        emitter.on("a/b/c/x", ({ type }) => {
            events.push(type)
        })
        scope.emit("x", 1)
        scope.off('x')          // 等效于退订a/b/c/x事件
        scope.emit("x", 1)
        expect(events).toEqual(["x", "a/b/c/x"])
    })
    test("scope once布订阅事件", () => {
        const emitter = new FastEvent()
        const scope = emitter.scope("a/b/c")
        const events: string[] = []
        scope.once("x", ({ type }) => {
            events.push(type)
        })
        emitter.once("a/b/c/x", ({ type }) => {
            events.push(type)
        })
        scope.emit("x", 1)
        expect(events).toEqual(["x", "a/b/c/x"])
    })

    test('scope waitFor', async () => {
        const emitter = new FastEvent();
        const scope = emitter.scope("a/b/c")

        // Arrange
        const event1Promise = scope.waitFor('x', 500);
        const event2Promise = scope.waitFor('y', 200);
        const event3Promise = scope.waitFor('z', 1000);

        // Act
        setTimeout(() => {
            scope.emit('x', 'payload1');
        }, 100);

        setTimeout(() => {
            scope.emit('y', 'payload2');
        }, 300);

        // Event2 will timeout before emission
        setTimeout(() => {
            scope.emit('z', 'payload3');
        }, 300);

        // Assert
        const results = await Promise.allSettled([
            event1Promise,
            event2Promise,
            event3Promise
        ]);

        expect(results[0].status).toBe('fulfilled');
        expect((results[0] as any).value).toEqual({ type: 'x', payload: 'payload1', meta: undefined });

        expect(results[1].status).toBe('rejected');
        //@ts-ignore
        expect(results[1].reason).toBeInstanceOf(Error);

        expect(results[2].status).toBe('fulfilled');
        expect((results[2] as any).value).toEqual({ type: 'z', payload: 'payload3', meta: undefined });
    });
    test('nested scope', async () => {
        type CustomEvents = {
            a: boolean
            b: number
            c: string
        }
        const emitter = new FastEvent();
        const listener = (({ type }) => {
            anyEvents.push(type)
        }) as FastEventListener

        emitter.onAny(listener)

        const scope = emitter.scope("a/b/c")
        scope.onAny(listener)

        const dScope = scope.scope("d") // a/b/c/d
        dScope.onAny(listener)

        const eScope = scope.scope("e")// a/b/c/e
        eScope.onAny(listener)

        const fScope = scope.scope("f")// a/b/c/f
        fScope.onAny(listener)

        const anyEvents: string[] = []
        emitter.emit("root", 1)
        scope.emit("c", 1)
        dScope.emit("d", 1)
        eScope.emit("e", 1)
        fScope.emit("f", 1)

        expect(anyEvents).toEqual([
            "root",
            "a/b/c/c",
            "c",
            "a/b/c/d/d",
            "d/d",
            "d",
            "a/b/c/e/e",
            "e/e",
            "e",
            "a/b/c/f/f",
            "f/f",
            "f",
        ])


    })
    test('nested scope2', async () => {
        type CustomEvents = {
            a: boolean
            b: number
            c: string
        }
        const emitter = new FastEvent();
        const listener = (({ type }) => {
            anyEvents.push(type)
        }) as FastEventListener

        emitter.onAny(listener)

        const scope = emitter.scope("a/b/c")
        scope.onAny(listener)

        const dScope = scope.scope("d") // a/b/c/d
        dScope.onAny(listener)

        const eScope = dScope.scope("e")// a/b/c/d/e
        eScope.onAny(listener)

        const fScope = eScope.scope("f")// a/b/c/d/e/f
        fScope.onAny(listener)

        const anyEvents: string[] = []
        emitter.emit("root", 1)
        scope.emit("c", 1)
        dScope.emit("d", 1)
        eScope.emit("e", 1)
        fScope.emit("f", 1)

        expect(anyEvents).toEqual([
            "root",
            "a/b/c/c",
            "c",
            "a/b/c/d/d",
            "d/d",
            "d",
            "a/b/c/d/e/e",
            "d/e/e",
            "e/e",
            "e",
            "a/b/c/d/e/f/f",
            "d/e/f/f",
            "e/f/f",
            "f/f",
            "f",
        ])


    })
    test('nested scope meta merged', async () => {
        type CustomEvents = {
            a: boolean
            b: number
            c: string
        }
        const emitter = new FastEvent({
            meta: { root: 1 }
        });


        let receiveMeta: any
        const listener = (({ type, meta }, args) => {
            receiveMeta = meta
        }) as FastEventListener

        emitter.onAny(listener)

        const scope = emitter.scope("a/b/c", {
            meta: { c: 1 }
        })
        scope.onAny(listener)

        const dScope = scope.scope("d", {
            meta: { d: 1 }
        })
        dScope.onAny(listener)

        const eScope = dScope.scope("e", {
            meta: { e: 1 }
        })// a/b/c/d/e
        eScope.onAny(listener)

        const fScope = eScope.scope("f", {
            meta: { f: 1 }
        })// a/b/c/d/e/f
        fScope.onAny(listener)

        emitter.emit("root", 1)
        expect(receiveMeta).toEqual({ root: 1 })
        scope.emit("c", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1 })
        dScope.emit("d", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, d: 1 })
        eScope.emit("e", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, d: 1, e: 1 })
        fScope.emit("f", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, d: 1, e: 1, f: 1 })

    })
    test('nested scope with meta', async () => {
        const listener = (({ type, meta }) => {
            receiveMeta = meta
        }) as FastEventListener

        const emitter = new FastEvent({
            meta: { 'root': 1 }
        }); let receiveMeta: any


        emitter.onAny(listener)

        const scope = emitter.scope("a/b/c", {
            meta: { 'c': 1 }
        })
        scope.onAny(listener)

        const dScope = scope.scope("d", {
            meta: { 'd': 1 }
        }) // a/b/c/d
        dScope.onAny(listener)

        const eScope = scope.scope("e", {
            meta: { 'e': 1 }
        })// a/b/c/e
        eScope.onAny(listener)

        const fScope = scope.scope("f", {
            meta: { 'f': 1 }
        })// a/b/c/f
        fScope.onAny(listener)

        emitter.emit("root", 1)
        expect(receiveMeta).toEqual({ root: 1 })
        scope.emit("c", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1 })
        dScope.emit("d", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, d: 1 })
        eScope.emit("e", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, e: 1 })
        fScope.emit("f", 1)
        expect(receiveMeta).toEqual({ root: 1, c: 1, f: 1 })

    })
})
