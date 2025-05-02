/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScopeMeta } from "../../scope"

describe("emit类型系统测试", () => {

    test("emit messages", () => {
        const emitter = new FastEvent({
            meta: {
                x: 1,
                y: true
            }
        })
        emitter.emit({
            type: "test",
            payload: 1,
            meta: {
                a: 1,
                x: 1,
                y: true
            }
        })
        emitter.on("test", (msg) => { }, {
            pipes: []
        })
    })

})