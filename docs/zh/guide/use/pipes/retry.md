# Retry

在监听器执行失败时自动重试，支持设置重试次数和间隔。

## 使用方法

```typescript 
import { retry } from 'fastevent/pipes'; // [!]code ++
emitter.on(
    'connect',
    async () => {
        await connectToServer();
    },
    {
        pipes: [retry(3)], // 失败时最多重试3次
    },
);
```

## 重试间隔

`interval`参数用于指定重试间隔，单位为毫秒。

```typescript 
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, {
                interval: 1000, // 1秒后重试 // [!code ++]
            }),
        ],
    },
);
```

`interval`参数支持传入一个函数，用于动态计算重试间隔。如下例可以让重试采用指数退避的重试.

```typescript
// 带指数退避的重试
emitter.on(
    'upload',
    async (msg) => {
        await uploadFile(msg.payload);
    },
    {
        pipes: [
            retry(4, {                 
                interval: (retryCount) => {
                    return 1000 * Math.pow(2, retryCount) // [!code ++]
                }, 
            }),
        ],
    },
);
``` 

## 丢弃消息

当重试次数超过限制时，`retry`会丢弃消息。你可以通过`drop`参数来指定一个函数，用于在丢弃消息时执行一些操作。

```typescript
// 自定义重试配置
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, { 
                drop: (msg, error) => console.error('最终失败:', error), // [!code ++]
            }),
        ],
    },
);
```