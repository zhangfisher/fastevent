# 中止执行

`FastEvent` 提供了中止执行异步监听器的解决方案，可以在`emit`时传入`AbortSignal`给所有事件监听器。

## 基本用法

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

// 创建一个 AbortController 实例
const abortController = new AbortController()

// 传入 AbortController.signal
emitter.emit("click", 1,{
    signal: abortController.signal
})
//
abortController.abort()   // [!code ++]

```

- 创建一个 `AbortController` 实例，在`emit`时传入一个`AbortController.signal`。
- 在异步监听器中，使用`abortSignal`来监听`abort`事件。

## 指南

### 传入已经中止的信号

如果在`emit`时传入一个已经中止的`AbortSignal`信号，监听器会直接返回`AbortError`。


```ts
import { FastEvent } from "fastevent"

const emitter = new FastEvent<{click: number}>()

emitter.on("click",  (message,{abortSignal}) => {
    
})

// 创建一个 AbortController 实例
const abortController = new AbortController()

abortController.abort()   // [!code ++]


// 传入 AbortController.signal
const results = emitter.emit("click", 1,{
    signal: abortController.signal
})
//
console.log(results)   // [AbortError]

```


### 处理中止信号

在异步监听器中，使用`abortSignal`来监听`abort`事件。

当`abort`事件触发时，监听器可以选择正常返回，也可以抛出`AbortError`。

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

// 创建一个 AbortController 实例
const abortController = new AbortController()

// 传入 AbortController.signal
const results = emitter.emit("click", 1,{
    signal: abortController.signal
})
//
console.log(results)   // [Promise]

setTimeout(()=>{
    abortController.abort()   // [!code ++]
},3000)

```
