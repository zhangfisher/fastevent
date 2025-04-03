import { describe, test, expect } from "vitest"
import { FastEvent } from "../event"
import { FastEventSubscriber } from "../types"



interface MyEvents{
    a:boolean
    b:number
    c:string
}


const emitter = new FastEvent<MyEvents>()

emitter.on("a",(ev)=>{
    ev.type ="a"
})