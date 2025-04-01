import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventSubscriber } from "../types"


describe("FastEvent",()=>{

    test("简单发布订阅事件",()=>{
        const emitter = new FastEvent() 
        emitter.on("x",(event)=>{
            expect(event.type).toBe("x")
            expect(event.payload).toBe(1)            
        })
        emitter.emit("x",1)
    })
    test("简单发布订阅事件后取消",()=>{
        const emitter = new FastEvent()         
        const events:string[]=[]
        const subscriber = emitter.on("x",(event)=>{
            expect(event.type).toBe("x")
            expect(event.payload).toBe(1)                    
            events.push(event.type)    
        })
        emitter.emit("x",1)
        expect(events).toEqual(["x"])
        subscriber.off()
        emitter.emit("x",1)
        emitter.emit("x",1)
        emitter.emit("x",1)
        expect(events).toEqual(["x"])
    })

    test("发布订阅层级事件",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        emitter.on("a.b.c",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)                                 
            events.push(event.type)       
        })
        emitter.emit("a",1)
        emitter.emit("a.b",1)
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c"])
    })
    test("使用通配符发布订阅层级事件",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*.*.*",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        subscribers.push(emitter.on("a.*.*",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        subscribers.push(emitter.on("a.b.*",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c"])
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c","a.b.c","a.b.c","a.b.c"])
        subscribers.forEach(subscriber=>subscriber.off())
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c","a.b.c","a.b.c","a.b.c"])
    })

    test("使用通配符发布订阅层级事件2",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*.*.*",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        subscribers.push(emitter.on("*.*.c",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        subscribers.push(emitter.on("*.a.b",(event)=>{
            expect(event.type).toBe("a.b.c")
            expect(event.payload).toBe(1)
            events.push(event.type)
        }))
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c"])
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c","a.b.c","a.b.c","a.b.c"])
        subscribers.forEach(subscriber=>subscriber.off())
        expect(events).toEqual(["a.b.c","a.b.c","a.b.c","a.b.c","a.b.c","a.b.c"])
    })

    test("简单发布订阅retain事件",()=>{
        const emitter = new FastEvent() 
        emitter.emit("x",1,true)        
        emitter.on("x",(event)=>{
            expect(event.type).toBe("x")
            expect(event.payload).toBe(1)            
        })
        emitter.emit("a.b.c1",1,true)        
        emitter.emit("a.b.c2",2,true)    
        emitter.on("a.b.c1",(event)=>{
            expect(event.type).toBe("a.b.c1")
            expect(event.payload).toBe(1)            
        })
        emitter.on("a.b.c2",(event)=>{
            expect(event.type).toBe("a.b.c2")
            expect(event.payload).toBe(2)            
        })
    })

    test("发布订阅通配符的retain事件",()=>{
        const emitter = new FastEvent() 
         
        emitter.emit("a.b.c1",1,true)        
        emitter.emit("a.b.c2",1,true)     
        const events:string[] = []
        // 订阅所有a.b.*事件,由于c,c2是
        emitter.on("a.b.*",(event)=>{
            events.push(event.type)
        })
        expect(events).toEqual(["a.b.c1","a.b.c2"])
    })



})