import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("简单发布与订阅", async () => {
    test("简单发布订阅事件", () => {
        const emitter = new FastEvent()
        emitter.on("x", ({ type, payload }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
        })
        emitter.emit("x", 1)
    })
    test("简单发布订阅事件后取消", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        const subscriber = emitter.on("x", ({ type, payload }) => {
            expect(type).toBe("x")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.emit("x", 1)
        expect(events).toEqual(["x"])
        subscriber.off()
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        emitter.emit("x", 1)
        expect(events).toEqual(["x"])
    })
    test("发布订阅层级事件", () => {
        const emitter = new FastEvent()
        const events: string[] = []
        emitter.on("a.b.c", ({ type, payload }) => {
            expect(type).toBe("a.b.c")
            expect(payload).toBe(1)
            events.push(type)
        })
        emitter.emit("a", 1)
        emitter.emit("a.b", 1)
        emitter.emit("a.b.c", 1)
        expect(events).toEqual(["a.b.c"])
    })
    test("返回事件执行结果", () => {
        const emitter = new FastEvent()
        for (let i = 1; i <= 10; i++) {
            emitter.on("x", () => {
                return i
            })
        }
        const results = emitter.emit("x", 1)
        expect(results).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    })
    test("监听器执行出错返回事件执行结果", async () => {
        const emitter = new FastEvent()
        for (let i = 1; i <= 10; i++) {
            emitter.on("x", () => {
                if (i % 2 == 0) throw new Error("custom")
                return i
            })
        }
        const results = emitter.emit("x", 1)
        for (let i = 1; i <= 10; i++) {
            if (i % 2 == 0) expect(results[i - 1]).toBeInstanceOf(Error)
            else expect(results[i - 1]).toBe(i)
        }
    })
    test("监听器执行出错时emit出错", async () => {
        const emitter = new FastEvent({ ignoreErrors: false })
        const err = new Error("custom")
        for (let i = 1; i <= 10; i++) {
            emitter.on("x", function xlistener() {
                if (i % 2 == 0) throw err
                return i
            })
        }
        expect(() => emitter.emit("x", 1)).toThrow(err);
        // @ts-ignore,  当执行监听器出错时会在错误对象上挂载一个_listener属性代表当前执行的监听器路径
        expect(err._emitter).toBe("xlistener:x")

    })
    test("添加监听器时指定顺序", async () => {
        const emitter = new FastEvent()
        const types: number[] = []
        emitter.on("x", () => {
            types.push(1)
        })

        emitter.on("x", () => {
            types.push(2)
        }, { prepend: true })
        emitter.emit("x")
        expect(types).toEqual([2, 1])
    })
    test("简单发布订阅message事件", () => {
        const emitter = new FastEvent()
        emitter.on("x", ({ type, payload, meta }) => {
            expect(type).toBe("x")
            expect(meta.a).toBe(1)
            expect(payload).toBe(1)
        })
        emitter.emit({
            type: "x",
            payload: 1,
            meta: { a: 1 }
        })
    })
    test("监听器的返回结果", async () => {
        const emitter = new FastEvent<{ click: number }>();

        emitter.on('click', () => 1)
        emitter.on('click', () => { throw new Error('custom') })
        emitter.on('click', async () => 2)
        emitter.on('click', async () => { throw new Error('custom') })

        const results = await Promise.allSettled(emitter.emit('click'))
        expect(results[0].status).toBe('fulfilled')
        expect((results[0] as any).value).toBe(1)

        expect(results[1].status).toBe('fulfilled')
        expect((results[1] as any).value).toBeInstanceOf(Error)

        expect(results[2].status).toBe('fulfilled')
        expect((results[2] as any).value).toBe(2)

        expect(results[3].status).toBe('fulfilled')
        expect((results[3] as any).value).toBeInstanceOf(Error)

    })
    test("ignoreErrors=false时监听器的返回结果", async () => {
        const emitter = new FastEvent<{ click: number }>({
            ignoreErrors: false
        });

        emitter.on('click', () => 1)
        emitter.on('click', () => { throw new Error('custom') })
        emitter.on('click', async () => 2)
        emitter.on('click', async () => { throw new Error('custom') })
        try {
            emitter.emit('click')
        } catch (e: any) {
            expect(e).toBeInstanceOf(Error)
        }
    })
})