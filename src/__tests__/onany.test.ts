import { describe, test, expect } from "vitest"
import { FastEvent } from "../event" 
 

describe("订阅所有事件", ()=>{
    test("订阅所有简单事件",()=>{
        const emitter = new FastEvent() 
        const allEvents:string[] =[]
        const allValues:number[]=[]
        const events:string[] =[]
        const values:number[]=[]
        emitter.onAny((payload,{type})=>{                
            allEvents.push(type)
            allValues.push(payload)
        })
        emitter.on("a",(payload,{type})=>{
            expect(type).toBe("a")
            values.push(payload)
            events.push(type)
        })
        emitter.on("b",(payload,{type})=>{
            expect(type).toBe("b")
            values.push(payload)
            events.push(type)
        })
        emitter.on("c",(payload,{type})=>{
            expect(type).toBe("c")
            values.push(payload)
            events.push(type)
        })
        emitter.on("d",(payload,{type})=>{
            expect(type).toBe("d")
            values.push(payload)
            events.push(type)
        })
        emitter.emit("a",1)        
        emitter.emit("b",2)
        emitter.emit("c",3)
        emitter.emit("d",4)

        expect(events).toEqual(["a","b","c","d"])
        expect(values).toEqual([1,2,3,4])
        expect(allEvents).toEqual(["a","b","c","d"])
        expect(allValues).toEqual([1,2,3,4]) 

    })
    test("通过on订阅所有简单事件",()=>{
        const emitter = new FastEvent() 
        const allEvents:string[] =[]
        const allValues:number[]=[]
        const events:string[] =[]
        const values:number[]=[]
        emitter.on("**",(payload,{type})=>{                
            allEvents.push(type)
            allValues.push(payload)
        })
        emitter.on("a",(payload,{type})=>{
            expect(type).toBe("a")
            values.push(payload)
            events.push(type)
        })
        emitter.on("b",(payload,{type})=>{
            expect(type).toBe("b")
            values.push(payload)
            events.push(type)
        })
        emitter.on("c",(payload,{type})=>{
            expect(type).toBe("c")
            values.push(payload)
            events.push(type)
        })
        emitter.on("d",(payload,{type})=>{
            expect(type).toBe("d")
            values.push(payload)
            events.push(type)
        })
        emitter.emit("a",1)        
        emitter.emit("b",2)
        emitter.emit("c",3)
        emitter.emit("d",4)

        expect(events).toEqual(["a","b","c","d"])
        expect(values).toEqual([1,2,3,4])
        expect(allEvents).toEqual(["a","b","c","d"])
        expect(allValues).toEqual([1,2,3,4]) 

    })
    test("订阅所有简单事件",()=>{
        const emitter = new FastEvent() 
        const allEvents:string[] =[]
        const allValues:number[]=[]
        const events:string[] =[]
        const values:number[]=[]
        emitter.onAny((payload,{type})=>{                
            allEvents.push(type)
            allValues.push(payload)
        })
        emitter.on("a.x.y",(payload,{type})=>{
            expect(type).toBe("a.x.y")
            values.push(payload)
            events.push(type)
        })
        emitter.on("b.m.n",(payload,{type})=>{
            expect(type).toBe("b.m.n")
            values.push(payload)
            events.push(type)
        })
        emitter.on("c.o.p",(payload,{type})=>{
            expect(type).toBe("c.o.p")
            values.push(payload)
            events.push(type)
        })
        emitter.on("d.q.r",(payload,{type})=>{
            expect(type).toBe("d.q.r")
            values.push(payload)
            events.push(type)
        })
        emitter.emit("a.x.y",1)        
        emitter.emit("b.m.n",2)
        emitter.emit("c.o.p",3)
        emitter.emit("d.q.r",4)

        expect(events).toEqual(["a.x.y","b.m.n","c.o.p","d.q.r"])
        expect(values).toEqual([1,2,3,4])
        expect(allEvents).toEqual(["a.x.y","b.m.n","c.o.p","d.q.r"])
        expect(allValues).toEqual([1,2,3,4])

    })
    test("取消订阅所有简单事件",()=>{
        const emitter = new FastEvent() 
        const allEvents:string[] =[]
        const allValues:number[]=[]
        const events:string[] =[]
        const values:number[]=[]
        const subscriber = emitter.onAny((payload,{type})=>{                
            allEvents.push(type)
            allValues.push(payload)
        })
        emitter.on("a",(payload,{type})=>{
            expect(type).toBe("a")
            values.push(payload)
            events.push(type)
        })
        emitter.on("b",(payload,{type})=>{
            expect(type).toBe("b")
            values.push(payload)
            events.push(type)
        })
        emitter.on("c",(payload,{type})=>{
            expect(type).toBe("c")
            values.push(payload)
            events.push(type)
        })
        emitter.on("d",(payload,{type})=>{
            expect(type).toBe("d")
            values.push(payload)
            events.push(type)
        })
        emitter.emit("a",1)        
        subscriber.off()
        emitter.emit("b",2)
        emitter.emit("c",3)
        emitter.emit("d",4)

        expect(events).toEqual(["a","b","c","d"])
        expect(values).toEqual([1,2,3,4])
        expect(allEvents).toEqual(["a"])
        expect(allValues).toEqual([1])  
    })

})

 