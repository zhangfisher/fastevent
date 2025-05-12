# Debounce

`Debounce`用于为监听器函数执行增加防抖控制，当监听器函数执行后一段时间内没有再次执行时，才真正执行监听器函数。

## 使用方法

```ts
import { debounce } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // 处理时间200ms
}, {
    pipes: [
        debounce(100) // 防抖时间100ms // [!code ++]
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
            debounce(100, { 
                drop: (msg, error) => {// [!code ++]
                   // // [!code ++] 
                }, // [!code ++]
            }),
        ],
    },
);
```