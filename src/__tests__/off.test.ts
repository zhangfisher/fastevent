import { describe, test, expect } from "vitest"
import { FastEvent } from "../event" 
 

describe("退订事件", ()=>{
    test("基本退订事件",()=>{
        const emitter = new FastEvent() 
        const events:string[] =[]
        const subscriber  = emitter.on("x",(payload,type)=>{
            expect(type).toBe("x")
            expect(payload).toBe(1)            
            events.push(type)
        })
        emitter.emit("x",1)
        subscriber.off()
        emitter.emit("x",1)
        expect(events).toEqual(["x"])
    })
    test("根据事件类型和侦听器进行退订",()=>{
        const emitter = new FastEvent() 
        const events:string[] =[]
        const listener =(payload:any,type:string)=>{
            expect(type).toBe("x")
            expect(payload).toBe(1)            
            events.push(type)
        }
        emitter.on("x",listener)
        emitter.emit("x",1)
        emitter.off("x",listener)
        emitter.emit("x",1)
        expect(events).toEqual(["x"])
    })
    test("多级事件根据事件类型和侦听器进行退订",()=>{
        const emitter = new FastEvent() 
        const events:string[] =[]
        const listener =(payload:any,type:string)=>{
            expect(type).toBe("a/b/c/d")
            expect(payload).toBe(1)            
            events.push(type)
        }
        emitter.on("a/b/c/d",listener)
        emitter.emit("a/b/c/d",1)
        emitter.off("a/b/c/d",listener) //
        emitter.emit("a/b/c/d",1)
        emitter.emit("a/b/c/d",2)
        emitter.emit("a/b/c/d",3)
        expect(events).toEqual(["a/b/c/d"])
    })
})

 