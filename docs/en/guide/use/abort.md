# Abort Execution

`FastEvent` provides a solution to abort the execution of asynchronous listeners by passing an `AbortSignal` to all event listeners during `emit`.

## Basic Usage

```ts
import { FastEvent } from "fastevent"

const emitter = new FastEvent<{click: number}>()

emitter.on("click",  (message,{abortSignal}) => {
    await new Promise((resolve) => { 
        abortSignal.addEventListener("abort", ()=>{
            clearTimeout(tmId)
            resolve()
        })
        doSomething()
        resolve()
    })
})

// Create an AbortController instance
const abortController = new AbortController()

// Pass AbortController.signal
emitter.emit("click", 1,{
    signal: abortController.signal
})
//
abortController.abort()   // [!code++]

```

- Create an `AbortController` instance and pass its `AbortController.signal` when calling `emit`.
- In the asynchronous listener, use `abortSignal` to listen for the `abort` event.

## Guide

### Passing an Already Aborted Signal

If an already aborted `AbortSignal` is passed during `emit`, the listener will directly return an `AbortError`.

```ts
import { FastEvent } from "fastevent"

const emitter = new FastEvent<{click: number}>()

emitter.on("click",  (message,{abortSignal}) => {
    
})

// Create an AbortController instance
const abortController = new AbortController()

abortController.abort()   // [!code++]


// Pass AbortController.signal
const results = emitter.emit("click", 1,{
    signal: abortController.signal
})
//
console.log(results)   // [AbortError]

```

### Handling Abort Signal

In asynchronous listeners, use `abortSignal` to listen for the `abort` event.

When the `abort` event is triggered, the listener can choose to either return normally or throw an `AbortError`.

```ts
import { FastEvent } from "fastevent"

const emitter = new FastEvent<{click: number}>()

emitter.on("click",  (message,{abortSignal}) => {
    return new Promise<void>((resolve, reject) => {        
        abortSignal.addEventListener("abort", ()=>{
            clearTimeout(tmId)
            reject(new AbortError())
        })
        doSomething()
        resolve()
    })
})

// Create an AbortController instance
const abortController = new AbortController()

// Pass AbortController.signal
const results = emitter.emit("click", 1,{
    signal: abortController.signal
})
//
console.log(results)   // [Promise]

setTimeout(()=>{
    abortController.abort()   // [!code++]
},3000)

```