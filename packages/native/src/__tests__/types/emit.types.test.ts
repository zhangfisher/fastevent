/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest"
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "../../event" 
import { Overloads } from '../../types';

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
    test('emit类型约束', () => {
        const emitter = new FastEvent<{
            a: boolean,
            b: number,
            c: string
        }>()
        // type D = Parameters<typeof emitter.emit>
        // type of = Overloads<typeof emitter.emit>

        // emitter.emit('a',1,true)
        // emitter.emit('a',true,true)
        // emitter.emit('b',true,true)
        // emitter.emit('b',1,true)
        // emitter.emit('c',1,true)
        // emitter.emit('c','',true)
        // emitter.emit('xx',1,true)

        
        // emitter.emit('a',1,{retain:true})
        // emitter.emit('b',1,{retain:true})
        // emitter.emit('c',1,{retain:true})
 
        // emitter.emit('a',true)
 
    })
     test('scope emit类型约束', () => {
        const emitter = new FastEvent()
        const scope =  emitter.scope<{
            a: boolean,
            b: number,
            c: string
        }>('x/y/z')

        // scope.emit('a',1,true)
        // scope.emit('a',true,true)
        // scope.emit('b',true,true)
        // scope.emit('b',1,true)
        // scope.emit('c',1,true)
        // scope.emit('c','',true)
        // scope.emit('xx',1,true)

        
        // scope.emit('a',1,{retain:true})
        // scope.emit('b',1,{retain:true})
        // scope.emit('c',1,{retain:true})
 
        // scope.emit('a',true)
 
    })
})