# Series

按顺序执行多个监听器。

## 基本用法

```ts
import { series } from 'fastevent/executors';
const emitter = new FastEvent()
const messages: FastEventMessage[] = []

// 创建10个监听器
const listeners = Array.from({ length: 10 }).map((_, i) => {
    return (message: FastEventMessage) => {
        messages.push(message)
        return ++i  // 返回序号
    }
})
listeners.forEach(listener => {
    emitter.on("test", listener)
})

const results = emitter.emitAsync<number>("test", 1, { 
    executor: series()    // [!code ++]
})
expect(results[0]).toBe(10) // 返回最后一个监听器的返回值
```

## 配置参数

`series`支持以下配置参数：

```ts
export type SeriesExecutorOptions = {
    /**
     * 反向执行监听器
     */
    reverse?: boolean
    /**
     * 控制监听器如何返回结果 
     */
    onReturns?: (results: any, cur: any) => any 
    /**
     * 在调用下一个监听器前执行
     */
    onNext?: (index: number, previous: any, 
            message: FastEventMessage, 
            args: FastEventListenerArgs, 
            results: any
    ) => boolean
    /**  
     * 
     * 当执行监听器出错时的回调，返回false中止后续执行
     * 
    */
    onError?: 'skip' | 'abort' | 'error' 
            | ((
                e: any, 
                message: FastEventMessage, 
                args: FastEventListenerArgs
            ) => void | 'skip' | 'abort' | 'error')
}
```


## 反向执行监听器

`options.reverse`默认为`false`，表示按顺序执行监听器，如果设置为`true`，则按逆序执行监听器。

```ts
import { series } from 'fastevent/executors';

const emitter = new FastEvent()
const messages: FastEventMessage[] = []
const listeners = Array.from({ length: 10 }).map((_,i) => {
    return (message: FastEventMessage) => {
        messages.push(message)
        return ++i // 返回序号
    }
})
listeners.forEach(listener => {
    emitter.on("test", listener)
})
const results = emitter.emit<number>("test", 1, {
    executor: series({
        reverse: true // [!code ++]
    })
})
const r = await Promise.all(results)
expect(r.length).toBe(1)
expect(r[0]).toBe(1) // 返回第一个监听器的返回值
```

## 处理返回结果

`onReturns`函数在每个监听器执行后调用，用于处理监听器的返回值。`onReturns`函数参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `results` | `any` | 监听器的返回值，第一次调用时为`undefined` |
| `cur` | `any` | 当前监听器的返回值 |

**本质上相当于一个`reduce`函数。**

```ts
import { series } from 'fastevent/executors';

const emitter = new FastEvent()
const messages: FastEventMessage[] = []
const listeners = Array.from({ length: 10 }).map((_, i) => {
    return async (message: FastEventMessage) => {
        messages.push(message)
        return ++i // 返回序号,从1开始
    }
})
listeners.forEach(listener => {
    emitter.on("test", listener)
})
const results = await emitter.emitAsync<number>("test", 1, {
    executor: series({// [!code ++]
        onReturns: (results: number, result: number) => {// [!code ++]
            if (results === undefined) results = 0// [!code ++]
            return results + result// [!code ++]
        }// [!code ++]
    })// [!code ++]
})
expect(results.length).toBe(1)
// 返回所有监听器的返回值之和
expect(results[0]).toBe(55)  // [!code ++]
```


## 拦截监听器执行

`onNext`函数在每个监听器执行前调用，用于拦截监听器的执行。`onNext`函数参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `index` | `number` | 当前监听器的索引 |
| `previous` | `any` | 上一个监听器的返回值 |
| `message` | `FastEventMessage` | 事件消息 |
| `args` | `FastEventListenerArgs` | 事件参数 |
| `results` | `any` | 监听器的返回值，第一次调用时为`undefined` |

**`onNext`返回值：**

| 返回值 | 说明 |
| --- | --- |
| `true \| undefined \| void` | 继续执行 |
| `false` | 中断执行,返加最近一个监听器的返回值 |

## 错误处理

`onError`函数在监听器执行出错时调用，用于处理错误。`onError`函数参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `e` | `any` | 错误对象 |
| `message` | `FastEventMessage` | 事件消息 |
| `args` | `FastEventListenerArgs` | 事件参数 |

**`onError`函数返回值：**

| 返回值 | 说明 |
| --- | --- |
| `skip` | 跳过当前监听器，继续执行后续的监听器 |  
| `abort` | 中断执行后续的监听器,返回最近一个监听器的返回值 |
| `error` | 中断执行后续的监听器,将错误对象返回。(不是触发错误) |
| `(e, message, args) => void \| skip \| abort \| error` | 返回错误响应行为的函数 |