/* eslint-disable no-unused-vars */
import { describe, test } from "vitest"
import type { Equal, Expect } from '@type-challenges/utils'
import { FastEvent } from "../../event"
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
                Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
            ]
        })
        emitter.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
            ]
        })

        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, CustomMeta & Record<string, any>>>
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
                Expect<Equal<typeof message.meta, OrderType & Record<string, any>>>
            ]
        })
        emitter.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType & Record<string, any>>>
            ]
        })

        emitter.onAny((message) => {
            type cases = [
                Expect<Equal<typeof message.meta, OrderType & Record<string, any>>>
            ]
        })
    })
    test("事件元数据推断", () => {
        const emitter = new FastEvent();
        emitter.emit('order/create', { orderId: '123', total: 99.99 }, {
            retain: false,
            meta: {
                timestamp: Date.now(),
                source: 'web',
                userId: 'user_123',
            }
        });

        emitter.on('order/create', (message) => {
            message.meta; // { timestamp: number; source: string; userId: string; }
            //
        });
    })

})
