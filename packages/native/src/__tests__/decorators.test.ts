import { describe, test, expect, vi, beforeAll } from 'vitest'
import { FastEvent } from '../event'
import type { FastEventMessage } from '../types'

describe('监听装饰器', () => {
    let emitter: FastEvent<CustomEvents>
    interface CustomEvents {
        a: boolean
        b: number
        c: string,
        "x/y/z/a": 1
        "x/y/z/b": 2
        "x/y/z/c": 3
    }

    beforeAll(() => {
        emitter = new FastEvent<CustomEvents>()
    })
    test("直接监听方法", () => {
        class MyClass {
            @emitter.on('a')
            test(message, args) {
                message.type
                message.payload
            }
        }
    })
})