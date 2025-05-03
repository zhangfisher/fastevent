# once() 方法

注册一次性事件监听器，事件触发后自动取消订阅。

## 方法签名

```ts
// 基本用法
once<T extends Types = Types>(
    type: T,
    listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Fallback<Context, typeof this>>,
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber

// 字符串事件类型
once<T extends string>(
    type: T,
    listener: FastEventAnyListener<Events, Meta, Fallback<Context, typeof this>>,
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber

// 全局监听所有事件
once(
    type: '**',
    listener: FastEventAnyListener<Record<string, any>, Meta, Fallback<Context, typeof this>>,
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber

// 无监听器版本
once<T extends Types = Types>(
    type: T,
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber

once<T extends string>(
    type: T,
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber

once(
    type: '**',
    options?: Omit<FastEventListenOptions<Events, Meta>, 'count'>
): FastEventSubscriber
```

## 参数

| 参数     | 类型                   | 描述                                                                                                                            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| type     | T \| string \| '\*\*'  | 事件类型，支持以下格式：<br>- 普通字符串：'user/login'<br>- 通配符：'user/\*'（匹配单层）<br>- 全局监听：'\*\*'（监听所有事件） |
| listener | FastEventListener      | 事件监听器函数                                                                                                                  |
| options  | FastEventListenOptions | 监听器配置选项（不包含 count 参数）                                                                                             |

### options 配置

```ts
interface FastEventListenOptions<Events, Meta> {
    prepend?: boolean; // 是否将监听器添加到监听器队列开头
    pipes?: FastListenerPipe[]; // 监听器管道
    filter?: (message: FastEventMessage<Events, Meta>) => boolean; // 过滤器函数
    off?: (message: FastEventMessage<Events, Meta>) => boolean; // 自动取消条件
}
```

## 返回值

返回 `FastEventSubscriber` 对象，包含以下属性：

```ts
interface FastEventSubscriber {
    off: () => void; // 取消监听的方法
    listener: FastEventListener; // 注册的监听器函数
}
```

## 示例

### 基本用法

```ts
emitter.once('initialized', (data) => {
    console.log('系统初始化完成:', data);
});
```

### 使用通配符

```ts
// 监听任意用户创建事件（只触发一次）
emitter.once('user.created', (data) => {
    console.log('新用户创建:', data);
});
```

### 全局监听

```ts
// 监听任意事件（只触发一次）
emitter.once('**', (eventName, data) => {
    console.log(`首次事件[${eventName}]触发:`, data);
});
```

### 自动取消条件

```ts
// 当data.error存在时自动取消监听
emitter.once('api.response', handleResponse, {
    off: (message) => !!message.payload.error,
});
```

## 注意事项

1. 该方法会自动在事件触发后取消订阅，相当于`on()`方法设置`count: 1`
2. 不能与`count`选项同时使用（会抛出错误）
3. 如果事件已经触发过且设置了保留(retain)，新注册的监听器会立即触发并取消
4. 适用于只需要响应一次的事件场景，如初始化完成、一次性通知等
5. 与`on()`方法相比，性能开销更小，适合短期监听需求

## 与 on()方法的区别

| 特性         | once()         | on()     |
| ------------ | -------------- | -------- |
| 触发次数     | 1 次           | 多次     |
| 自动取消     | 是             | 否       |
| 保留事件处理 | 立即触发并取消 | 正常触发 |
| 性能         | 更优           | 稍差     |
| 适用场景     | 一次性事件     | 持续监听 |
