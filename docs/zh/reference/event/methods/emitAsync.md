# emitAsync() 方法

异步触发指定事件。

## 方法签名

```ts
// 基本用法
emitAsync<T extends Types = Types>(
    type: T,
    payload?: Events[T],
    meta?: Meta
): Promise<FastEventMessage<Events, Meta>[]>

// 字符串事件类型
emitAsync<T extends string>(
    type: T,
    payload?: any,
    meta?: Meta
): Promise<FastEventMessage<Events, Meta>[]>

// 使用消息对象
emitAsync(
    message: FastEventMessage<Events, Meta>
): Promise<FastEventMessage<Events, Meta>[]>
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
    timestamp: number; // 时间戳
    emitter: FastEvent<Events, Meta>; // 事件发射器实例
}
```

## 返回值

返回 `Promise<FastEventMessage<Events, Meta>[]>`，解析为所有触发的事件消息对象数组。

## 示例

### 基本用法

```ts
// 异步触发事件
const results = await emitter.emitAsync('user.login', {
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

### 使用 async/await

```ts
async function processLogin(userData) {
    try {
        const messages = await emitter.emitAsync('user.login', userData);
        console.log('登录事件处理完成', messages);
    } catch (error) {
        console.error('事件处理出错', error);
    }
}
```

### 并行处理

```ts
// 并行触发多个事件
Promise.all([emitter.emitAsync('event1', data1), emitter.emitAsync('event2', data2)]).then(([results1, results2]) => {
    console.log('所有事件处理完成');
});
```

### 错误处理

```ts
// 配置忽略错误为false
const emitter = new FastEvent({
    ignoreErrors: false,
});

// 捕获异步错误
emitter.emitAsync('error.event', errorData).catch((error) => {
    console.error('捕获到事件错误', error);
});
```

## 与 emit()方法的区别

| 特性     | emitAsync()         | emit()   |
| -------- | ------------------- | -------- |
| 执行方式 | 异步                | 同步     |
| 返回值   | Promise             | 直接返回 |
| 错误处理 | 可通过 Promise 捕获 | 默认忽略 |
| 适用场景 | 耗时操作            | 即时操作 |
| 执行顺序 | 并行执行监听器      | 顺序执行 |
