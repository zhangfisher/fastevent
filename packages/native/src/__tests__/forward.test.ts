import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"

describe("转发发布和订阅", async () => {
    test("转发订阅和发布事件", () => {
        const otherEmitter = new FastEvent()
        const emitter = new FastEvent({
            onAddListener: (type, listener, options) => {
                if (type.startsWith('@/')) {
                    return otherEmitter.on(type.substring(2), listener, options)
                }
            },
            onBeforeExecuteListener: (message, args) => {
                if (message.type.startsWith('@/')) {
                    message.type = message.type.substring(2)
                    return otherEmitter.emit(message, args)
                }
            }
        })
        const events: any[] = []
        otherEmitter.on("data", ({ payload }) => {
            events.push(payload)
        })
        // 订阅otherEmitter的data事件
        emitter.on("@/data", ({ payload }) => {
            expect(payload).toBe(1)
            events.push(payload)
        })
        emitter.emit("@/data", 1)
        expect(events).toEqual([1, 1])

    })
    test('转发订阅', () => {
        const otherEmitter = new FastEvent()
        const emitter = new FastEvent({
            onAddListener: (type, listener, options) => {
                // 订阅转发规则：当事件名称以`@/`开头时，将订阅转发到另外一个`FastEvent`实例
                if (type.startsWith('@/')) {
                    return otherEmitter.on(type.substring(2), listener, options)
                }
            }
        })
        const events: any[] = []
        // 订阅data事件
        emitter.on("@/data", ({ payload }) => {
            events.push(payload)
        })
        // 发布data事件
        otherEmitter.emit("data", 1)
        expect(events).toEqual([1])
    })

})
