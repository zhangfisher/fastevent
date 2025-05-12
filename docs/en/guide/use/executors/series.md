# Series

Executes multiple listeners in sequence.

## Basic Usage

```ts
import { series } from 'fastevent/executors';
const emitter = new FastEvent()
const messages: FastEventMessage[] = []

// Create 10 listeners
const listeners = Array.from({ length: 10 }).map((_, i) => {
    return (message: FastEventMessage) => {
        messages.push(message)
        return ++i  // Return the sequence number
    }
})
listeners.forEach(listener => {
    emitter.on("test", listener)
})

const results = emitter.emitAsync<number>("test", 1, { 
    executor: series()    // [!code ++]
})
expect(results[0]).toBe(10) // Returns the value of the last listener
```

## Configuration Parameters

`series` supports the following configuration parameters:

```ts
export type SeriesExecutorOptions = {
    /**
     * Execute listeners in reverse order
     */
    reverse?: boolean
    /**
     * Control how listeners return results 
     */
    onReturns?: (results: any, cur: any) => any 
    /**
     * Execute before calling the next listener
     */
    onNext?: (index: number, previous: any, 
            message: FastEventMessage, 
            args: FastEventListenerArgs, 
            results: any
    ) => boolean
    /**  
     * 
     * Callback when a listener execution error occurs, return false to abort subsequent execution
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


## Execute Listeners in Reverse Order

`options.reverse` defaults to `false`, meaning listeners are executed in sequence. If set to `true`, listeners are executed in reverse order.

```ts
import { series } from 'fastevent/executors';

const emitter = new FastEvent()
const messages: FastEventMessage[] = []
const listeners = Array.from({ length: 10 }).map((_,i) => {
    return (message: FastEventMessage) => {
        messages.push(message)
        return ++i // Return sequence number
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
expect(r[0]).toBe(1) // Returns the value of the first listener
```

## Handle Return Results

The `onReturns` function is called after each listener executes, used to process the listener's return value. `onReturns` function parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `results` | `any` | The listener's return value, `undefined` on first call |
| `cur` | `any` | The current listener's return value |

**Essentially equivalent to a `reduce` function.**

```ts
import { series } from 'fastevent/executors';

const emitter = new FastEvent()
const messages: FastEventMessage[] = []
const listeners = Array.from({ length: 10 }).map((_, i) => {
    return async (message: FastEventMessage) => {
        messages.push(message)
        return ++i // Return sequence number, starting from 1
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
// Returns the sum of all listener return values
expect(results[0]).toBe(55)  // [!code ++]
```


## Intercept Listener Execution

The `onNext` function is called before each listener executes, used to intercept listener execution. `onNext` function parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `index` | `number` | Current listener index |
| `previous` | `any` | Previous listener's return value |
| `message` | `FastEventMessage` | Event message |
| `args` | `FastEventListenerArgs` | Event parameters |
| `results` | `any` | Listener's return value, `undefined` on first call |

**`onNext` return values:**

| Return Value | Description |
| --- | --- |
| `true \| undefined \| void` | Continue execution |
| `false` | Interrupt execution, return the most recent listener's return value |

## Error Handling

The `onError` function is called when a listener execution error occurs, used to handle errors. `onError` function parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `e` | `any` | Error object |
| `message` | `FastEventMessage` | Event message |
| `args` | `FastEventListenerArgs` | Event parameters |

**`onError` function return values:**

| Return Value | Description |
| --- | --- |
| `skip` | Skip the current listener, continue executing subsequent listeners |  
| `abort` | Interrupt execution of subsequent listeners, return the most recent listener's return value |
| `error` | Interrupt execution of subsequent listeners, return the error object (does not trigger an error) |
| `(e, message, args) => void \| skip \| abort \| error` | Function that returns error response behavior |