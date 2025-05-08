# 事件触发

FastEvent 提供了灵活且强大的事件触发机制，支持多种触发方式和选项。

## 事件触发方式

`emit`或`emitAsync` 方法用于同步或异步触发事件。

### 基本触发方式

最简单的触发方式是使用`事件类型:type`和`数据:payload`作为参数：

```typescript
const events = new FastEvent();

// 触发简单事件
emitter.emit('user/login', { id: 1, name: 'Alice' });
await emitter.emitAsync('user/login', { id: 1, name: 'Alice' });

// 触发事件并保留事件消息
emitter.emit(
    'user/login',
    { id: 1, name: 'Alice' }, // 事件数据
    true, // 是否保留
);
await emitter.emitAsync(
    'user/login',
    { id: 1, name: 'Alice' }, // 事件数据
    true, // 是否保留
);
```

### 消息对象形式

你也可以使用消息对象来触发事件，这种方式更加灵活：

```typescript
emitter.emit({
    type: 'user/login', // 事件类型
    payload: { id: 1, name: 'Alice' }, // 事件数据负载
    meta: { timestamp: Date.now() }, // 可选，额外元数据
});
await emitter.emitAsync({
    type: 'user/login', // 事件类型
    payload: { id: 1, name: 'Alice' }, // 事件数据负载
    meta: { timestamp: Date.now() }, // 可选，额外元数据
});
```

## 指南

### 事件触发结果

`emit`和`emitAsync`触发结果时会执行注册的监听器函数并返回结果。

```typescript
emitter.on('event', () => 1);
emitter.on('event', () => 2);
emitter.on('event', () => 3);

const result = emitter.emit('event'); // [1, 2, 3]
const result = await emitter.emitAsync('event'); // [1, 2, 3]
```

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
emitter.emit('system/status', { online: true }, true);
// 等效于: emitter.emit('system/status', { online: true },{ retain: true })

// 后续的订阅者会立即收到保留的事件
emitter.on('system/status', (message) => {
    console.log('当前状态:', message.payload.online);
});
// 可以清除保留的事件。
import { ClearRetainMessage } from 'fastevent'
emitter.emit('system/status',ClearRetainMessage)

```
:::warning 提示
- 保留事件也叫粘性消息。
- `ClearRetainMessage`是一个`symbol`类型，用于清除保留的事件。
- `emitter.retainedMessages`记录了所有保留的消息。
:::

### 返回结果

`emit`和`emitAsync`触发结果时会执行注册的监听器函数并返回结果。

```typescript
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();

emitter.on('event', async (message) => {
    await delay(100);
    return 1;
});
emitter.on('event', async (message) => {
    await delay(300);
    return 2;
});
emitter.on('event', async (message) => {
    await delay(500);
    return 3;
});

// 触发异步事件并等待所有监听器完成
// @noErrors
const results = await emitter.emitAsync('event');
//    ^^^^^^^
// results === [1, 2, 3]
// @noErrors
const results = emitter.emit('event');
//    ^^^^^^^
// results === [1, 2, 3]
```

### 错误处理

当异步监听器函数抛出错误时，`emit/emitAsync`返回结果中会包括`Error`对象。

```typescript
const emitter = new FastEvent();

emitter.on('event', async (message) => {
    await delay(100);
    return 1;
});
emitter.on('event', async (message) => {
    throw new Error('custom error'); // [!code ++]
});
emitter.on('event', async (message) => {
    await delay(500);
    return 3;
});

// 触发异步事件并等待所有监听器完成
const results = await emitter.emitAsync('event');
// results === [1,
//              Error('custom error'),   // [!code ++]
//             3]
```

### 带元数据的触发

触发事件时可以指定额外元数据用来传递给监听者。

```typescript
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();
emitter.emit('order/create', { orderId: '123', total: 99.99 }, false, {
    timestamp: Date.now(),
    source: 'web',
    userId: 'user_123',
});

emitter.on('order/create', (message) => {
    message.meta; // { timestamp: number; source: string; userId: string; }
});
```

-   `message.meta` 是一个对象，包含额外元数据。
-   `emit`时指定的元数据无法自动推断类型。
-   更多关于元数据的信息，请参考[元数据](./metadata)。

### 类型安全的事件触发

使用 `TypeScript` 时，`FastEvent` 提供了完整的类型检查：

```typescript
import { FastEvent } from 'fastevent';

interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
    'system/error': { code: string; message: string };
}

const emitter = new FastEvent<MyEvents>();

emitter.onAny<number>((message) => {});

// ✅ 正确：数据类型匹配
emitter.emit('user/login', { id: 1, name: 'Alice' });

// ✅ 正确：消息对象
emitter.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
});
// ✅ 正确：支持触发未定义的事件类型
emitter.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
// ✅ 正确：支持触发 未定义的事件类型
emitter.emit('xxxx', 1);

// ❌ 错误：已声明事件类型payload不匹配
events.emit('user/login', { id: '1', name: 'Alice' }); // TypeScript 错误
events.emit('user/login', 1); // TypeScript 错误
events.emit('order', '1');
// ❌ 错误：id类型不匹配
events.emit({
    type: 'user/login',
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
emitter.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
```

因为`FastEvent.emit`提供多个不同的函数调用签名，当`type`是`string`时，`payload`按`any`进行推断,所以`emit`函数调用是正确的。
:::

## API

### emit

`emit`支持多种调用方式，函数签名如下：

```ts
emit<R = any, T extends Types = Types>(type: T, payload?: Events[T], retain?: boolean): R[]
emit<R = any, T extends string = string>(type: T, payload?: T extends Types ? Events[Types] : any, retain?: boolean): R[]
emit<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>, retain?: boolean): R[]
emit<R = any>(message: FastEventEmitMessage<Events, Meta>, retain?: boolean): R[]
//----
emit<R = any, T extends Types = Types>(type: T, payload?: Events[T], options?: FastEventListenerArgs<Meta>): R[]
emit<R = any, T extends string = string>(type: T, payload?: T extends Types ? Events[Types] : any, options?: FastEventListenerArgs<Meta>): R[]
emit<R = any, T extends string = string>(message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>, options?: FastEventListenerArgs<Meta>): R[]
emit<R = any>(message: FastEventEmitMessage<Events, Meta>, options?: FastEventListenerArgs<Meta>): R[]
```

以上`emit`丰富的调用签名，大体可以分为以下几种情况：

-   **指定`type`和`payload`触发事件**

```typescript
emitter.emit('click', 100);
emitter.emit('click', 100, true); // 保留消息
emitter.emit('click', 100, { retain: true }); // 保留消息
emitter.emit('click', 100, { ... }); // 携带额外触发参数
```

-   **指定`message`触发事件**

```typescript
emitter.emit({ type: 'click',payload: 100});
// 保留消息
emitter.emit({ type: 'click',payload: 100 },true);
// 保留消息
emitter.emit({ type: 'click',payload: 100 },{retain:true});
// 携带额外触发参数
emitter.emit({ type: 'click',payload: 100 },{retain:true,....});
```

### emitAsync

`emitAsync`是`emit`的异步版本，代码如下：

```ts
public async emitAsync<R = any>(): Promise<[R | Error][]> {
    const results = await Promise.allSettled(this.emit.apply(this, arguments as any))
    return results.map((result) => {
        if (result.status === 'fulfilled') {
            return result.value
        } else {
            return result.reason
        }
    })
}
```

使用方式与`emit`相同，差别在于内部调用了`Promise.allSettled`并返回的` Promise<[R | Error][]>`。

### 触发参数

`emit/emitAsync`方法允许传递一些额外的参数，这些参数用于控制事件触发行为。

```typescript
export type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Record<string, any> & Partial<M>;
    abortSignal?: AbortSignal; // 用于传递给监听器函数
    executor?: FastListenerExecutorArgs;
};
```

| 参数名        | 类型                       | 描述                                                                                  |
| ------------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `retain`      | `boolean`                  | 是否保留消息，如果为`true`，则最后一条消息被保留,详见[保留消息](./retain-messages.md) |
| `meta`        | `Record<string, any>`      | 事件元数据，用于传递给监听器                                                          |
| `abortSignal` | `AbortSignal`              | 用于传递给监听器函数,详见[中止监听器](./abort.md)                                     |
| `executor`    | `FastListenerExecutorArgs` | 用于控制监听器执行行为,详见[执行器](./executor.md)                                    |
