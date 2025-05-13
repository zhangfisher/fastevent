/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEventBus, FastEventBusNode } from "../../eventbus"

declare module '../../eventbus/types' {
    interface FastEventBusEvents {
        submit: string
        click: number
    }

    interface FastEventBusNodes {
        auth: any
        user: any
    }
}
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
        eventbus.broadcast({
            type: 'xx',
            payload: '1111'
        })
        eventbus.broadcast('data', 1)
        eventbus.broadcast('x', 2222)
        eventbus.broadcast('y', 2222)
        eventbus.broadcast('z', 1)
        eventbus.broadcast('x', 1)

        type cases = [
        ]
    })
    test("node.broadcast", () => {
        const eventbus = new FastEventBus<CustomBusEvents>()
        const node = new FastEventBusNode()
        node.connect(eventbus)
        node.broadcast({
            type: 'submit',
            payload: '1'
        })
        node.broadcast({
            type: 'submitx',
            payload: 1
        })
        node.broadcast('submit2', 1)
        node.broadcast('submit', '1')
    })
    test("node.send", () => {
        const eventbus = new FastEventBus<CustomBusEvents>()
        const node = new FastEventBusNode<CustomNodeEvents>()
        node.connect(eventbus)
        node.send('auth', 1)
        node.send('user', 1)
        node.emit("c")
    })
})