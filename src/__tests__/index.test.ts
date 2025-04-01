import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"


describe("FastEvent",()=>{

    test("订阅事件",()=>{
        const emitter = new FastEvent() 
        emitter.on("x",()=>{})
        emitter.on("y",()=>{})
        emitter.on("z",()=>{})
        emitter.on("a",()=>{})        
        emitter.on("a.b1",()=>{})
        emitter.on("a.b1.c",()=>{})
        emitter.on("a.b1.c.d",()=>{})
        emitter.on("a.b1.c.d.e",()=>{})
        emitter.on("a.b2",()=>{})
        


    })

})