/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScopeMeta } from "../../scope"
import { FastEventBus } from "../../eventbus"
import { Overloads } from "../../types"

describe("eventbus类型系统测试", () => {

    test("点对点发送消息", () => {
        const eventbus = new FastEventBus()

        type SendTypes = Overloads<typeof eventbus.send>



        type cases = [

        ]
    })
    test("eventbus.on", () => {
        const eventbus = new FastEventBus()

        type OnTypes = Overloads<typeof eventbus.on>
        type d = Parameters<OnTypes[0]>[0]



        type cases = [

        ]
    })
})