import { describe, test, expect } from "vitest"
import { FastEvent } from "../event" 
 

describe("scope", ()=>{
    test("scope简单的发布订阅事件",()=>{
        const emitter = new FastEvent() 
        const scope = emitter.scope("a/b/c")

        const events:string[] =[]
        const listener = (payload:any,type:any)=>{
            events.push(type)
        }
        scope.on("x",listener)
        emitter.on("a/b/c/x",listener)
        scope.emit("x",1)        
        expect(events).toEqual(["x","a/b/c/x"])
    })


})

 