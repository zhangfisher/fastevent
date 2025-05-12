# Throttle

`Throttle`用于为监听器函数执行增加节流控制。

## 使用方法

```ts
import {  throttle } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // 处理时间200ms
}, {
    pipes: [
        throttle(100) // 节流时间100ms // [!code ++]
    ]  
}) 
```

## 丢弃消息

提供`drop`回调参数，在消息被丢弃时调用。

```typescript
// 自定义重试配置
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            throttle(100, { 
                drop: (msg, error) => {// [!code ++]
                   // // [!code ++] 
                }, // [!code ++]
            }),
        ],
    },
);
```