# on() 方法

注册事件监听器。

## 方法签名

```ts
// 基本用法
on<T extends Types = Types>(
    type: T,
    listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// 字符串事件类型
on<T extends string>(
    type: T,
    listener: FastEventAnyListener<Events, Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// 全局监听所有事件
on(
    type: '**',
    listener: FastEventAnyListener<Record<string, any>, Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// 无监听器版本
on<T extends Types = Types>(
    type: T,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

on<T extends string>(
    type: T,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

on(
    type: '**',
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber
```

## 参数

| 参数     | 类型                   | 描述                                                                                                                            |
| -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| type     | T \| string \| '\*\*'  | 事件类型，支持以下格式：<br>- 普通字符串：'user/login'<br>- 通配符：'user/\*'（匹配单层）<br>- 全局监听：'\*\*'（监听所有事件） |
| listener | FastEventListener      | 事件监听器函数                                                                                                                  |
| options  | FastEventListenOptions | 监听器配置选项                                                                                                                  |

### options 配置

```ts
interface FastEventListenOptions<Events, Meta> {
    count?: number; // 触发次数限制，0表示无限制
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
emitter.on('user.login', (data) => {
    console.log('用户登录:', data);
});
```

### 使用通配符

```ts
// 监听所有user路径下的事件
emitter.on('user/*', (data) => {
    console.log('用户事件:', data);
});
```

### 限制触发次数

```ts
// 最多触发3次
emitter.on('notification', handleNotification, { count: 3 });
```

### 全局监听

```ts
// 监听所有事件
emitter.on('**', (eventName, data) => {
    console.log(`事件[${eventName}]触发:`, data);
});
```

### 自动取消条件

```ts
// 当data.error存在时自动取消监听
emitter.on('api.response', handleResponse, {
    off: (message) => !!message.payload.error,
});
```

## 注意事项

1. 事件类型不能为空字符串
2. 通配符`*`只匹配单层路径，`**`匹配多层路径
3. 当使用保留事件(retain)时，新注册的监听器会立即收到最近一次的保留消息
4. 监听器执行顺序默认按照注册顺序，除非设置`prepend: true`
