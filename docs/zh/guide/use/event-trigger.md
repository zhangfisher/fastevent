# 事件触发

FastEvent 提供了灵活且强大的事件触发机制，支持多种触发方式和选项。

## 事件触发方式

`emit`或`emitAsync` 方法用于同步或异步触发事件。

### 基本触发方式

最简单的触发方式是使用`事件类型:type`和`数据:payload`作为参数：

```typescript
const events = new FastEvent();

// 触发简单事件
events.emit('user/login', { id: 1, name: 'Alice' });
await events.emitAsync('user/login', { id: 1, name: 'Alice' });

// 触发事件并保留事件消息
events.emit(
    'user/login',
    { id: 1, name: 'Alice' }, // 事件数据
    true, // 是否保留
);
await events.emitAsync(
    'user/login',
    { id: 1, name: 'Alice' }, // 事件数据
    true, // 是否保留
);
```

### 消息对象形式

你也可以使用消息对象来触发事件，这种方式更加灵活：

```typescript
events.emit({
    type: 'user/login', // 事件类型
    payload: { id: 1, name: 'Alice' }, // 事件数据负载
    meta: { timestamp: Date.now() }, // 可选，额外元数据
});
await events.emitAsync({
    type: 'user/login', // 事件类型
    payload: { id: 1, name: 'Alice' }, // 事件数据负载
    meta: { timestamp: Date.now() }, // 可选，额外元数据
});
```

## 指南

### 异步事件触发

对于需要等待所有监听器完成的场景，可以使用 `emitAsync`,`emitAsync`会使用`Promise.allSetted`来执行所有监听器并返回结果。

### 调用次数限制

触发事件时，可以限制监听器被调用的最大次数：

```typescript
// 最多触发3次后移除监听器
emitter.on('event', handler, { count: 3 });

// 等效的once语法糖
emitter.on('event', handler, { count: 1 });
// 等同于
emitter.once('event', handler);
```

### 前置插入

默认情况下，使用`on/once`注册监听器时将监听器添加到队列末尾,启用`prepend=true`可能将监听器添加到队列开头而非末尾,这将影响监听器的执行顺序。

```typescript
emitter.on('event', handler1);
emitter.on('event', handler2, { prepend: true });
// 调用顺序: handler2 -> handler1
```

### 保留事件

设置 `retain=true` 可以保留事件供后续订阅者使用：

```typescript
// 触发并保留事件
events.emit('system/status', { online: true }, { retain: true });

// 后续的订阅者会立即收到保留的事件
events.on('system/status', (message) => {
    console.log('当前状态:', message.payload.online);
});
```

### 带元数据的触发

你可以在触发事件时附加元数据：

```typescript
events.emit('order/create', { orderId: '123', total: 99.99 }, false, {
    timestamp: Date.now(),
    source: 'web',
    userId: 'user_123',
});
```

### 类型安全的事件触发

使用 TypeScript 时，FastEvent 提供了完整的类型检查：

```typescript twoslash
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
    'system/error': { code: string; message: string };
}

const events = new FastEvent<MyEvents>();

events.onAny<number>((message) => {
    if (message.type === '1111') {
    }
    message.type = 'user/login';
    message.payload;
});

// ✅ 正确：数据类型匹配
events.emit('user/login', { id: 1, name: 'Alice' });
// ✅ 正确：消息对象
events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
});
// ✅ 正确：支持触发未定义的事件类型
events.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
// ✅ 正确：支持触发 未定义的事件类型
events.emit('xxxx', 1);

// ❌ 错误：已声明事件类型payload不匹配
events.emit('user/login', { id: '1', name: 'Alice' }); // TypeScript 错误
// ❌ 错误：id类型不匹配
events.emit({
    type: 'user/login',
    payload: { id: '1', name: 'Alice' },
});

const scope = events.scope('user');

// ✅ 正确：数据类型匹配
scope.emit('user/login', { id: 1, name: 'Alice' });
// ✅ 正确：支持触发 未定义的事件类型
scope.emit('xxxx', 1);
// ✅ 正确：消息对象
scope.emit({
    type: 'login',
    payload: { id: 1, name: 'Alice' },
});
// ✅ 正确：支持触发未定义的事件类型
scope.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});

// ❌ 错误：已声明事件类型payload不匹配
scope.emit('login', { id: '1', name: 'Alice' }); // TypeScript 错误
// ❌ 错误：id类型不匹配
scope.emit({
    type: 'login',
    payload: { id: '1', name: 'Alice' },
});
```

**`FastEvent`第一个泛型参数用来声明事件类型:**

```typescript
interface MyEvents {
    [事件类型名称]：<事件消息负载类型>
}
const events = new FastEvent<MyEvents>();
```

:::warning 注意
在上例中，我们声明了`MyEvents`接口，为什么以下类型是正确的呢？

```ts
events.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
```

因为`FastEvent.emit`提供多个不同的函数调用签名，当`type`是`string`时，`payload`按`any`进行推断,所以`emit`函数调用是正确的。
:::
