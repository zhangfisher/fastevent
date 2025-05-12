# Timeout

为监听器函数执行增加超时控制，当执行超时时返回超时错误`TimeoutError`实例。

## 使用方法

```ts
import { timeout } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // 处理时间200ms
}, {
    pipes: [
        timeout(100) // 超时时间100ms // [!code ++]
    ]  
})
const results = emitter.emitAsync("test", 1)
//results[0] === TimeoutError
```


## 提供默认值

当监听器函数执行超时时，可以指定一个默认的返回值。

```ts
import { timeout } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // 处理时间200ms
}, {
    pipes: [
        timeout(100, "default value") // 超时时间100ms // [!code ++]
    ]  
})
const results = emitter.emitAsync("test", 1)
//results[0] === "default value"
```
