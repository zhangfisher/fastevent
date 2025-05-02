import { describe, test, expect, vi, beforeAll, beforeEach } from 'vitest'
import { FastEvent } from '../event'
import type { FastEventListenerArgs, FastEventMessage } from '../types'

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

    beforeEach(() => {
        emitter = new FastEvent<CustomEvents>()
    })
    test("通过装饰器on直接监听事件", () => {
        class MyClass {
            values: number[] = []
            @emitter.on('a')
            test(message: FastEventMessage, args: FastEventListenerArgs) {
                expect(this).toBeInstanceOf(MyClass)
                this.values.push(message.payload)
            }
        }
        const my = new MyClass()
        const length: number = 10
        for (let i = 1; i <= length; i++) {
            emitter.emit('a', i)
        }
        expect(my.values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])


    })
    test("通过装饰器once直接监听事件", () => {
        class MyClass {
            values: number[] = []
            @emitter.once('a')
            test(message: FastEventMessage, args: FastEventListenerArgs) {
                this.values.push(message.payload)
                expect(this).toBeInstanceOf(MyClass)
            }
        }
        const my = new MyClass()
        const length: number = 10
        for (let i = 1; i <= length; i++) {
            emitter.emit('a', i)
        }
        expect(my.values).toEqual([1])


    })
})