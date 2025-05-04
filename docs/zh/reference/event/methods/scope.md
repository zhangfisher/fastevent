# scope() 方法

创建并返回一个新的事件作用域实例。

## 方法签名

```ts
scope<
    E extends Record<string, any> = Record<string, any>,
    P extends string = string,
    M extends Record<string, any> = Record<string, any>,
    C = Context
>(prefix: P, options?: FastEventScopeOptions<M, C>)
```

## 参数

| 参数    | 类型                                 | 描述           |
| ------- | ------------------------------------ | -------------- |
| `prefix` | `string` | 作用域前缀 |
| `options` | `FastEventScopeOptions<Meta, Context>` | 作用域配置选项 |
| `options.meta` | `Meta` | 作用域元数据 |
| `options.context` | `string` | 作用域上下文  |
| `options.executor` | `FastListenerExecutorArgs` | 作用域事件执行器 |
 

## 返回值

返回 `FastEventScope<Events, Meta, Context>` 实例，具有与 FastEvent 相同的接口。
