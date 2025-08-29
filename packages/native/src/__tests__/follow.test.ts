import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastListenerFlags } from "../types"


describe("订阅Follow事件", () => {
    test("同步默认执行follow事件", () => {
        const emitter = new FastEvent()
        const values: number[] = [] 
        emitter.on("a", ({ payload, type }) => {
            values.push(9)
        },{
            flags:FastListenerFlags.follow  
        }) 
        
        emitter.on("a", () => { values.push(1)}) 
        emitter.on("a", () => { values.push(2)}) 
        emitter.on("a", () => { values.push(3)}) 
        emitter.on("a", () => { values.push(4)}) 
        emitter.emit('a')
        expect(values).toEqual([1,2,3,4,9])

    }) 
})

