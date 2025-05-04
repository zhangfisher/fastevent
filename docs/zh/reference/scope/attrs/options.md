# Options

配置参数。

```ts
type FastEventScopeOptions<Meta, Context> = {
    // 作用域元数据
    meta?: FastEventMeta & Meta
    // 监听器执行上下文
    context?: Context
    // 监听器执行策略
    executor?: FastListenerExecutorArgs
}
```
