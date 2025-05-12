# Timeout

Adds timeout control to listener function execution, returns a `TimeoutError` instance when execution times out.

## Usage

```ts
import { timeout } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // Processing time 200ms
}, {
    pipes: [
        timeout(100) // Timeout time 100ms // [!code ++]
    ]  
})
const results = emitter.emitAsync("test", 1)
//results[0] === TimeoutError
```


## Providing Default Values

When the listener function execution times out, you can specify a default return value.

```ts
import { timeout } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // Processing time 200ms
}, {
    pipes: [
        timeout(100, "default value") // Timeout time 100ms // [!code ++]
    ]  
})
const results = emitter.emitAsync("test", 1)
//results[0] === "default value"
```