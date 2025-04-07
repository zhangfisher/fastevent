import { describe, test, expect } from "vitest"
import { FastEvent } from "../event" 

describe("简单发布与订阅",async ()=>{
    test("简单发布订阅事件",()=>{
        const emitter = new FastEvent() 
        emitter.on("x",(payload,{type})=>{
            expect(type).toBe("x")
            expect(payload).toBe(1)            
        })
        emitter.emit("x",1)
    })
    test("简单发布订阅事件后取消",()=>{
        const emitter = new FastEvent()         
        const events:string[]=[]
        const subscriber = emitter.on("x",(payload,{type})=>{
            expect(type).toBe("x")
            expect(payload).toBe(1)                    
            events.push(type)    
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
        emitter.on("a.b.c",(payload,{type})=>{
            expect(type).toBe("a.b.c")
            expect(payload).toBe(1)                                 
            events.push(type)       
        })
        emitter.emit("a",1)
        emitter.emit("a.b",1)
        emitter.emit("a.b.c",1)
        expect(events).toEqual(["a.b.c"])
    })
    test("返回事件执行结果",()=>{
        const emitter = new FastEvent() 
        for(let i=1;i<=10;i++){
            emitter.on("x",()=>{
                return i
            })
        }
        const results = emitter.emit("x",1)
        expect(results).toEqual([1,2,3,4,5,6,7,8,9,10])
    })
    test("侦听器执行出错返回事件执行结果",async ()=>{
        const emitter = new FastEvent() 
        for(let i=1;i<=10;i++){
            emitter.on("x",()=>{
                if(i % 2 ==0) throw new Error("custom")
                return i
            })
        }
        const results = emitter.emit("x",1)
        for(let i=1;i<=10;i++){
            if(i % 2 ==0) expect(results[i-1]).toBeInstanceOf(Error)
            else expect(results[i-1]).toBe(i)    
        }
    })
    test("侦听器执行出错时emit出错",async ()=>{
        const emitter = new FastEvent({ignoreErrors:false}) 
        const err = new Error("custom")
        for(let i=1;i<=10;i++){
            emitter.on("x",()=>{
                if(i % 2 ==0) throw err
                return i
            })
        }
        expect(()=>emitter.emit("x",1)).toThrow(err);
        // @ts-ignore,  当执行侦听器出错时会在错误对象上挂载一个_listener属性代表当前执行的侦听器路径
        expect(err._trigger).toBe("x")
        
    })
}) 
 