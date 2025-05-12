/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScopeMeta } from "../../scope"
import { FastEventBus } from "../../eventbus"
import { Overloads } from "../../types"

describe("eventbus类型系统测试", () => {

    type CustomBusEvents = {
        x: string
        y: number
        z: boolean
    }
    type CustomNodeEvents = {
        a: string
        b: number
        c: boolean
    }

    test("broadcast类型", () => {
        const eventbus = new FastEventBus<CustomBusEvents>()
        eventbus.broadcast({
            type: 'x',
            payload: '1111'
        })
        // eventbus.broadcast('data', 1)
        // eventbus.broadcast('y', 2222)
        // eventbus.broadcast('z', 1)

        type cases = [

        ]
    })
    test("eventbus.on", () => {
        const eventbus = new FastEventBus<CustomBusEvents>()

        eventbus.on('x', (message) => {
            message
        })
        type cases = [

        ]
    })
})