import { describe, test, expect } from "vitest"
import { FastEvent } from "../event" 
 

describe("scope", ()=>{
    test("scope简单的发布订阅事件",()=>{
        const emitter = new FastEvent() 
        const scope = emitter.scope("a/b/c")
        const events:string[] =[] 
        scope.on("x", (payload,{type})=>{
            events.push(type)
        })
        emitter.on("a/b/c/x", (payload,{type})=>{
            events.push(type)
        })
        scope.emit("x",1)        
        expect(events).toEqual(["x","a/b/c/x"])
    })

    test("scope通过off简单的退订事件",()=>{
        const emitter = new FastEvent() 
        const scope = emitter.scope("a/b/c")

        const events:string[] =[] 
        const subscriber =scope.on("x", (payload,{type})=>{
            events.push(type)
        })
        emitter.on("a/b/c/x", (payload,{type})=>{
            events.push(type)
        })
        scope.emit("x",1)        
        subscriber.off()
        scope.emit("x",1)      
        expect(events).toEqual(["x","a/b/c/x","a/b/c/x"])
    })

    test("scope off退订事件",()=>{
        const emitter = new FastEvent() 
        const scope = emitter.scope("a/b/c")

        const events:string[] =[] 
        scope.on("x", (payload,{type})=>{
            events.push(type)
        })
        emitter.on("a/b/c/x", (payload,{type})=>{
            events.push(type)
        })
        scope.emit("x",1)        
        scope.off('x')          // 等效于退订a/b/c/x事件
        scope.emit("x",1)      
        expect(events).toEqual(["x","a/b/c/x"])
    })
    test("scope once布订阅事件",()=>{
        const emitter = new FastEvent() 
        const scope = emitter.scope("a/b/c")
        const events:string[] =[] 
        scope.once("x", (payload,{type})=>{
            events.push(type)
        })
        emitter.once("a/b/c/x", (payload,{type})=>{
            events.push(type)
        })
        scope.emit("x",1)        
        expect(events).toEqual(["x","a/b/c/x"])
    })

    test('scope waitFor', async () => {
        const emitter = new FastEvent();
        const scope = emitter.scope("a/b/c")

        // Arrange
        const event1Promise = scope.waitFor('x', 500);
        const event2Promise = scope.waitFor('y', 200);
        const event3Promise = scope.waitFor('z', 1000);

        // Act
        setTimeout(() => {
            scope.emit('x', 'payload1');
        }, 100);

        setTimeout(() => {
            scope.emit('y', 'payload2');
        }, 300);

        // Event2 will timeout before emission
        setTimeout(() => {
            scope.emit('z', 'payload3');
        }, 300);

        // Assert
        const results = await Promise.allSettled([
            event1Promise,
            event2Promise,
            event3Promise
        ]);

        expect(results[0].status).toBe('fulfilled');
        expect(results[0]).toHaveProperty('value', 'payload1');
        
        expect(results[1].status).toBe('rejected'); 
        //@ts-ignore
        expect(results[1].reason).toBeInstanceOf(Error);
        
        expect(results[2].status).toBe('fulfilled');
        expect(results[2]).toHaveProperty('value', 'payload3');
    });


})

 