// eslint-disable no-unused-vars
import type { Equal, Expect, NotAny } from '@type-challenges/utils'
import { FastEvent } from "./event"
import { ScopeEvents } from "./types" 



interface CustomEvents{
    a        : boolean
    b        : number
    c        : string,
    "x/y/z/a": 1
    "x/y/z/b": 2
    "x/y/z/c":3
}

type  ScopeCustomEvents = ScopeEvents<CustomEvents,'x/y/z'>

type cases = [
    Expect<Equal<ScopeCustomEvents,{
        a:1
        b:2
        c:3
    }>>
]  


const emitter = new FastEvent<CustomEvents>() 

emitter.on("a",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"a">>,
        Expect<Equal<typeof payload,boolean>>
    ]    
})

emitter.on("b",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"b">>,
        Expect<Equal<typeof payload,number>>
    ]   
})

emitter.once("a",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"a">>,
        Expect<Equal<typeof payload,boolean>>
    ]    
})

emitter.once("b",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"b">>,
        Expect<Equal<typeof payload,number>>
    ]   
})
emitter.emit("x/y/z",1)
 

// ----- scope -----

const scope = emitter.scope("x/y/z")

scope.on("a",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"a">>,
        Expect<Equal<typeof payload,1>>
    ]  
}) 

scope.on("b",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"b">>,
        Expect<Equal<typeof payload,2>>
    ]  
}) 

scope.once("a",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"a">>,
        Expect<Equal<typeof payload,1>>
    ]  
}) 

scope.once("c",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"c">>,
        Expect<Equal<typeof payload,3>>
    ]  
}) 
emitter.on("x/y/z",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"x/y/z">>,
        Expect<Equal<typeof payload,unknown>>
    ]   
})
emitter.on("x/y/z/a",(payload,{type})=>{
    type cases = [
        Expect<Equal<typeof type,"x/y/z/a">>,
        Expect<Equal<typeof payload,1>>
    ]   
}) 