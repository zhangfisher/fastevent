# 监听管理

## 概念

监听管道(`Pipe`)是 `FastEvent` 提供的一种强大机制，用于控制和修改事件监听器函数的执行行为。通过`pipe`，你可以为监听器函数的执行添加`超时控制`、`节流`、`防抖`、`重试`等功能，使事件处理更加灵活和可控。

## 基本使用

在注册事件监听器时，可以通过`options.pipes`参数来使用一个或多个`pipe`：

```typescript
emitter.on('eventName', listener, {
  pipes: [pipe1(), pipe2(), ...]
})
```

多个`pipe`会按照数组顺序依次处理，形成处理链。等效于``pip23(pipe2(pipe1(listener)))....`

以下是一个简单的使用`pipe`的示例，展示如何为 API 请求添加超时和重试功能

```typescript
import { timeout, retry } from 'fastevent/pipes'; // [!code ++]
// 添加超时和重试功能
emitter.on(
    'api/request',
    async (msg) => {
        // 处理API请求
    },
    {
        pipes: [
            timeout(5000), // 5秒超时// [!code ++]
            retry(3), // 失败时最多重试3次// [!code ++]
        ],
    },
);
```