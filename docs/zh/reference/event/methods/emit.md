# emit() 方法

同步触发指定事件。

## 方法签名

```ts
// 基本用法
emit<T extends Types = Types>(
    type: T,
    payload?: Events[T],
    meta?: Meta
): FastEventMessage<Events, Meta>[]

// 字符串事件类型
emit<T extends string>(
    type: T,
    payload?: any,
    meta?: Meta
): FastEventMessage<Events, Meta>[]

// 使用消息对象
emit(
    message: FastEventMessage<Events, Meta>
): FastEventMessage<Events, Meta>[]
```

## 参数

### 基本用法参数

| 参数    | 类型             | 描述             |
| ------- | ---------------- | ---------------- |
| type    | T \| string      | 要触发的事件类型 |
| payload | Events[T] \| any | 事件负载数据     |
| meta    | Meta             | 事件元数据       |

### 消息对象参数

```ts
interface FastEventMessage<Events, Meta> {
    type: string; // 事件类型
    payload?: any; // 事件负载数据
    meta?: Meta; // 元数据
    emitter: FastEvent<Events, Meta>; // 事件发射器实例
}
```

## 返回值

返回 `FastEventMessage<Events, Meta>[]` 数组，包含所有触发的事件消息对象。

## 示例

### 基本用法

```ts
// 触发事件并传递数据
const results = emitter.emit('user.login', {
    userId: 123,
    username: 'testuser',
});

// 结果示例:
// [{
//   type: 'user.login',
//   payload: { userId: 123, username: 'testuser' },
//   meta: undefined,
//   timestamp: 1620000000000,
//   emitter: [FastEvent实例]
// }]
```

### 使用元数据

```ts
emitter.emit(
    'api.request',
    {
        method: 'GET',
        url: '/users',
    },
    {
        requestId: 'abc123',
        source: 'mobile',
    },
);
```

### 使用消息对象

```ts
const message = {
    type: 'notification',
    payload: {
        title: '系统通知',
        content: '您有新的消息',
    },
    meta: {
        priority: 'high',
    },
};

emitter.emit(message);
```

### 链式调用

```ts
emitter.on('event1', handler1).on('event2', handler2).emit('event1', data1).emit('event2', data2);
```

## 注意事项

1. 同步执行特性：

    - 所有监听器会按照注册顺序同步执行
    - 方法会在所有监听器执行完成后才返回
    - 适合需要确保事件处理完成的场景

2. 错误处理：

    - 默认会忽略监听器抛出的错误(ignoreErrors: true)
    - 可以通过配置设置 ignoreErrors: false 来捕获错误
    - 错误会作为消息对象的一部分返回

3. 性能考虑：

    - 大量监听器会影响执行速度
    - 复杂监听器可能导致调用栈过深
    - 对于耗时操作建议使用 emitAsync()

4. 通配符匹配：

    - 会触发匹配的所有监听器
    - 包括全局监听器('\*_')和通配符监听器('user/_')

5. 保留事件：
    - 如果事件设置了保留(retain)，新监听器会立即收到最后的消息
    - 保留的消息也会被 emit()触发
