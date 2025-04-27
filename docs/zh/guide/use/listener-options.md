# 监听器选项

FastEvent 提供了丰富的监听器配置选项，可以灵活控制监听行为。

## 基本选项

### count (调用次数限制)

限制监听器被调用的最大次数：

```typescript
// 最多触发3次
emitter.on('event', handler, { count: 3 });

// 等效的once语法糖
emitter.on('event', handler, { count: 1 });
// 等同于
emitter.once('event', handler);
```

### prepend (前置插入)

将监听器添加到队列开头而非末尾：

```typescript
emitter.on('event', handler1);
emitter.on('event', handler2, { prepend: true });
// 调用顺序: handler2 -> handler1
```

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

## 高级选项

### priority (优先级)

数值越大优先级越高，默认 0：

```typescript
emitter.on('event', handler1, { priority: 10 });
emitter.on('event', handler2, { priority: 5 });
emitter.on('event', handler3);
// 调用顺序: handler1 -> handler2 -> handler3
```

### filter (条件过滤)

只有当条件满足时才调用监听器：

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
