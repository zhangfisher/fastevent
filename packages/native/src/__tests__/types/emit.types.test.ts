/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event"
import { FastEventScopeMeta } from "../../scope"
import { FastMessage } from "../../types"

describe("emit类型系统测试", () => {
    interface CustomEvents {
        a: boolean
        b: number
        c: string,
        "x/y/z/a": 1
        "x/y/z/b": 2
        "x/y/z/c": 3
    }
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
    test("emit messages with type", () => {
        const emitter = new FastEvent<CustomEvents>()
        emitter.emit({
            type: "a",
            payload: true,
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