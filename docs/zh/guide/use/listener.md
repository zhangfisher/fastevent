# 事件监听器

订阅事件时需要提供一个事件监听器用于接收事件消息，事件监听器函数签名如下：

```ts
export type FastEventListener<T extends string = string, P = any, M = unknown, C = any> = (
    this: C,
    message: FastEventMessage<
        {
            [K in T]: P;
        },
        M
    >,
) => any | Promise<any>;
```

-   `FastEventListener`是一个普通的函数类型,可以是同步或异步函数，接收一个事件消息对象作为参数，返回值可以是任意类型。

## 指南

### context (执行上下文)

设置监听器的 `this` 上下文：

```typescript
const service = {
    name: 'myService',
    handle() {
        console.log(this.name); // 'myService'
    },
};

emitter.on('event', service.handle, { context: service });
```

### filter (条件过滤)

提供额外的监听拦截，只有当条件满足时才调用监听器：

```typescript
emitter.on('event', handler, {
    filter: (message) => message.payload.value > 10,
});
```

### until (终止条件)

当条件满足时自动移除监听器：

```typescript
emitter.on('event', handler, {
    until: (message) => message.payload.status === 'done',
});
```

## 类型定义

所有监听器选项的类型定义：

```typescript
interface FastEventListenOptions {
    count?: number; // 调用次数限制
    prepend?: boolean; // 是否前置插入
    context?: any; // 执行上下文
    priority?: number; // 优先级(0-100)
    filter?: (message: FastEventMessage) => boolean; // 条件过滤
    until?: (message: FastEventMessage) => boolean; // 终止条件
}
```

## 组合使用示例

```typescript
emitter.on(
    'order/update',
    (message) => {
        console.log('订单更新:', message.payload);
    },
    {
        count: 5, // 最多处理5次
        priority: 80, // 高优先级
        filter: (msg) => msg.payload.amount > 100, // 只处理大额订单
        context: orderService, // 指定执行上下文
    },
);
```
