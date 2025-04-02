import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventSubscriber } from "../types"


describe("FastEvent",()=>{
    describe("简单发布与订阅",async ()=>{
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
    })
    describe("多级事件的发布与订阅",async ()=>{        
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
    })
    describe("支持基于通配符的发布与订阅",async ()=>{
            
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

        test("使用通配符发布订阅层级事件11",()=>{
            const emitter = new FastEvent() 
            const events:string[]=[]
            const subscribers:FastEventSubscriber[]=[]
            subscribers.push(emitter.on("*.*.*",(event)=>{
                expect(event.type).toBe("a.b.c")
                expect(event.payload).toBe(1)
                events.push(event.type)
            })) 
            emitter.emit("a.b.c",1)
            expect(events).toEqual(["a.b.c"]) 
        })


        test("使用通配符发布订阅层级事件12",()=>{
            const emitter = new FastEvent() 
            const events:string[]=[]
            const subscribers:FastEventSubscriber[]=[]
            subscribers.push(emitter.on("a.*.*",(event)=>{
                expect(event.type).toBe("a.b.c")
                expect(event.payload).toBe(1)
                events.push(event.type)
            })) 
            emitter.emit("a.b.c",1)
            expect(events).toEqual(["a.b.c"]) 
        })
        test("使用通配符发布订阅层级事件13",()=>{
            const emitter = new FastEvent() 
            const events:string[]=[]
            const subscribers:FastEventSubscriber[]=[]
            subscribers.push(emitter.on("a.b.*",(event)=>{
                expect(event.type).toBe("a.b.c")
                expect(event.payload).toBe(1)
                events.push(event.type)
            })) 
            emitter.emit("a.b.c",1)
            expect(events).toEqual(["a.b.c"]) 
        })

        test("使用通配符发布订阅层级事件14",()=>{
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
            subscribers.push(emitter.on("*.b.c",(event)=>{
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
        test("使用通配符发布订阅层级事件15",()=>{
            const emitter = new FastEvent() 
            const events:string[]=[]
            const subscribers:FastEventSubscriber[]=[]
            subscribers.push(emitter.on("*.b.c",(event)=>{
                expect(event.type).toBe("a.b.c")
                expect(event.payload).toBe(1)
                events.push(event.type)
            }))
            emitter.emit("a.b.c",1)
            expect(events).toEqual(["a.b.c"]) 
        })
        test("使用通配符发布订阅层级事件16",()=>{
            const emitter = new FastEvent() 
            const events:string[]=[]
            const subscribers:FastEventSubscriber[]=[]
            subscribers.push(emitter.on("*.b.*.d.*.f",(event)=>{
                events.push(event.type)
            }))
            emitter.emit("1.b.1.d.1.f",1)
            emitter.emit("2.b.2.d.2.f",1)
            emitter.emit("3.b.3.d.3.f",1)
            emitter.emit("4.b.4.d.4.f",1)
            emitter.emit("5.b.5.d.5.f",1)
            expect(events).toEqual(["1.b.1.d.1.f","2.b.2.d.2.f","3.b.3.d.3.f","4.b.4.d.4.f","5.b.5.d.5.f"]) 
        })
        
    }) 

    describe("订阅与发布retain事件",async ()=>{
            
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
        test("不处理通配符的retain事件",()=>{
            const emitter = new FastEvent()              
            emitter.emit("a.b.c1",1,true)        
            emitter.emit("a.b.c2",2,true)     
            const events:string[] = []
            // 订阅所有a.b.*事件,由于c1,c2是
            emitter.on("a.b.*",(event)=>{
                events.push(event.type)
            })
            expect(events).toEqual([])
        })
        test("简单发布订阅retain事件",()=>{
            const emitter = new FastEvent()  
            const events:string[] = []
            emitter.emit("a",1,true)        
            emitter.emit("a.b",2,true)    
            emitter.emit("a.b.c",3,true)    
            emitter.emit("a.b.c.d",4,true)    
            
            emitter.on("a",(event)=>{
                expect(event.type).toBe("a")
                expect(event.payload).toBe(1)            
                events.push(event.type)
            })
            emitter.on("a.b",(event)=>{
                expect(event.type).toBe("a.b")
                expect(event.payload).toBe(2)            
                events.push(event.type)
            })
            emitter.on("a.b.c",(event)=>{
                expect(event.type).toBe("a.b.c")
                expect(event.payload).toBe(3)            
                events.push(event.type)
            })
            emitter.on("a.b.c.d",(event)=>{
                expect(event.type).toBe("a.b.c.d")
                expect(event.payload).toBe(4)            
                events.push(event.type)
            })
            expect(events).toEqual(["a","a.b","a.b.c","a.b.c.d"])            
        })
    })

    describe("只订阅一次的事件的发布与订阅",async ()=>{
        test("简单发布只订阅一次事件",()=>{
            const emitter = new FastEvent() 
            const events:string[] =[]
            emitter.once("x",(event)=>{
                expect(event.type).toBe("x")
                expect(event.payload).toBe(1)            
                events.push(event.type)
            })
            emitter.emit("x",1)
            emitter.emit("x",1)
            emitter.emit("x",1)
            emitter.emit("x",1)
            expect(events).toEqual(["x"])
        })
        test("简单发布只订阅一次事件后取消",()=>{
            const emitter = new FastEvent()         
            const events:string[]=[]
            const subscriber = emitter.once("x",(event)=>{
                expect(event.type).toBe("x")
                expect(event.payload).toBe(1)                    
                events.push(event.type)    
            })
            subscriber.off()
            emitter.emit("x",1)
            emitter.emit("x",1)
            emitter.emit("x",1)
            expect(events).toEqual([])
        })
        test("简单发布只订阅一次的多级事件",()=>{
            const emitter = new FastEvent() 
            const events:string[] =[]
            emitter.once("a.b.c.d",(event)=>{
                expect(event.type).toBe("a.b.c.d")
                expect(event.payload).toBe(1)            
                events.push(event.type)
            })
            emitter.emit("a.b.c.d",1)
            emitter.emit("a.b.c.d",2)
            emitter.emit("a.b.c.d",3)
            emitter.emit("a.b.c.d",4)
            expect(events).toEqual(["a.b.c.d"])
        })        
        test("混合发布只订阅一次的多级事件",()=>{
            const emitter = new FastEvent() 
            const events:string[] =[]
            const values:number[]=[]
            emitter.once("a.b.c.d",(event)=>{
                expect(event.type).toBe("a.b.c.d")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("a.b.c.d",(event)=>{
                expect(event.type).toBe("a.b.c.d")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.emit("a.b.c.d",1)
            emitter.emit("a.b.c.d",2)
            emitter.emit("a.b.c.d",3)
            emitter.emit("a.b.c.d",4)
            expect(events).toEqual(["a.b.c.d","a.b.c.d","a.b.c.d","a.b.c.d","a.b.c.d"])
            expect(values).toEqual([1,1,2,3,4])
        })


    })

    describe("订阅所有事件", ()=>{
        test("订阅所有简单事件",()=>{
            const emitter = new FastEvent() 
            const allEvents:string[] =[]
            const allValues:number[]=[]
            const events:string[] =[]
            const values:number[]=[]
            emitter.onAny((event)=>{                
                allEvents.push(event.type)
                allValues.push(event.payload)
            })
            emitter.on("a",(event)=>{
                expect(event.type).toBe("a")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("b",(event)=>{
                expect(event.type).toBe("b")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("c",(event)=>{
                expect(event.type).toBe("c")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("d",(event)=>{
                expect(event.type).toBe("d")
                values.push(event.payload)
                events.push(event.type)
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
            emitter.on("**",(event)=>{                
                allEvents.push(event.type)
                allValues.push(event.payload)
            })
            emitter.on("a",(event)=>{
                expect(event.type).toBe("a")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("b",(event)=>{
                expect(event.type).toBe("b")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("c",(event)=>{
                expect(event.type).toBe("c")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("d",(event)=>{
                expect(event.type).toBe("d")
                values.push(event.payload)
                events.push(event.type)
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
            emitter.onAny((event)=>{                
                allEvents.push(event.type)
                allValues.push(event.payload)
            })
            emitter.on("a.x.y",(event)=>{
                expect(event.type).toBe("a.x.y")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("b.m.n",(event)=>{
                expect(event.type).toBe("b.m.n")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("c.o.p",(event)=>{
                expect(event.type).toBe("c.o.p")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("d.q.r",(event)=>{
                expect(event.type).toBe("d.q.r")
                values.push(event.payload)
                events.push(event.type)
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
            const subscriber = emitter.onAny((event)=>{                
                allEvents.push(event.type)
                allValues.push(event.payload)
            })
            emitter.on("a",(event)=>{
                expect(event.type).toBe("a")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("b",(event)=>{
                expect(event.type).toBe("b")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("c",(event)=>{
                expect(event.type).toBe("c")
                values.push(event.payload)
                events.push(event.type)
            })
            emitter.on("d",(event)=>{
                expect(event.type).toBe("d")
                values.push(event.payload)
                events.push(event.type)
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


})