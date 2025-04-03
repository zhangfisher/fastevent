import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventSubscriber } from "../types"

 
describe("基于通配符的发布与订阅",async ()=>{
        
    test("使用通配符发布订阅层级事件",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*/*/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        subscribers.push(emitter.on("a/*/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        subscribers.push(emitter.on("a/b/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c"])
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c","a/b/c","a/b/c","a/b/c"])
        subscribers.forEach(subscriber=>subscriber.off())
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c","a/b/c","a/b/c","a/b/c"])
    })

    test("使用通配符发布订阅层级事件11",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*/*/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        })) 
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c"]) 
    })


    test("使用通配符发布订阅层级事件12",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("a/*/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        })) 
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c"]) 
    })
    test("使用通配符发布订阅层级事件13",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("a/b/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        })) 
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c"]) 
    })

    test("使用通配符发布订阅层级事件14",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*/*/*",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        subscribers.push(emitter.on("*/*/c",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        subscribers.push(emitter.on("*/b/c",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c"])
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c","a/b/c","a/b/c","a/b/c"])
        subscribers.forEach(subscriber=>subscriber.off())
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c","a/b/c","a/b/c","a/b/c"])
    })
    test("使用通配符发布订阅层级事件15",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*/b/c",(payload,type)=>{
            expect(type).toBe("a/b/c")
            expect(payload).toBe(1)
            events.push(type)
        }))
        emitter.emit("a/b/c",1)
        expect(events).toEqual(["a/b/c"]) 
    })
    test("使用通配符发布订阅层级事件16",()=>{
        const emitter = new FastEvent() 
        const events:string[]=[]
        const subscribers:FastEventSubscriber[]=[]
        subscribers.push(emitter.on("*/b/*/d/*/f",(payload,type)=>{
            events.push(type)
        }))
        emitter.emit("1/b/1/d/1/f",1)
        emitter.emit("2/b/2/d/2/f",1)
        emitter.emit("3/b/3/d/3/f",1)
        emitter.emit("4/b/4/d/4/f",1)
        emitter.emit("5/b/5/d/5/f",1)
        expect(events).toEqual(["1/b/1/d/1/f","2/b/2/d/2/f","3/b/3/d/3/f","4/b/4/d/4/f","5/b/5/d/5/f"]) 
    })
    test("使用通配符发布订阅层级事件17",()=>{
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent()
            emitter.on('a/b/c/*', () => {
                resolve()
            })  
            emitter.emit('a/b/c/x', 1)
            emitter.emit('a/b/c/x', 1)
        })
    }) 
    test("使用多级路径匹配",()=>{
        const emitter = new FastEvent() 
        const payloads:number[]=[]
        const events:string[]=[]
        emitter.on("a/**",(payload,type)=>{
            events.push(type)
            payloads.push(payload)            
        })         
        emitter.emit("a/b/c/d/e/f",1)
        expect(events).toEqual(["a/b/c/d/e/f"])
        expect(payloads).toEqual([1]) 
    })
    test("使用多级路径匹配2",()=>{
        const emitter = new FastEvent() 
        const payloads:number[]=[]
        const events:string[]=[]
        emitter.on("a/**",(payload,type)=>{
            events.push(type)
            payloads.push(payload)            
        })
        
        emitter.emit("a/b",1)        
        emitter.emit("a/b/c",2)
        emitter.emit("a/b/c/d",3)
        emitter.emit("a/b/c/d/e",4)
        emitter.emit("a/b/c/d/e/f",5)
        expect(events).toEqual(["a/b","a/b/c","a/b/c/d","a/b/c/d/e","a/b/c/d/e/f"])
        expect(payloads).toEqual([1,2,3,4,5]) 
    })
    test("使用多级路径匹配3",()=>{
        const emitter = new FastEvent() 
        const payloads:number[]=[]
        const events:string[]=[]
        emitter.on("a/**",(payload,type)=>{
            events.push(type)
            payloads.push(payload)            
        })
        emitter.on("a/b/*",(payload,type)=>{
            events.push(type)
            payloads.push(payload)            
        })       
        emitter.emit("a/b/c",1)
        emitter.emit("a/b/c/d",2)
        emitter.emit("a/b/c/d/e",3)
        emitter.emit("a/b/c/d/e/f",4)
        expect(events).toEqual(["a/b/c","a/b/c","a/b/c/d","a/b/c/d/e","a/b/c/d/e/f"])
        expect(payloads).toEqual([1,1,2,3,4]) 
    })
}) 
 
 