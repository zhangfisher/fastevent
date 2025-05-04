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

注册监听器时，可以传入参数`FastEventListenOptions`用来控制监听器的行为，可选参数：
 
```ts
export type FastEventListenOptions = {
    // 侦听执行次数，当为1时为单次侦听，为0时为永久侦听，其他值为执行次数,每执行一次减一，减到0时移除侦听器
    count?: number
    // 将侦听器添加到侦听器列表的头部
    prepend?: boolean
    filter?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // 当执行侦听器前，如果此函数返回true则自动注销监听
    off?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // 对监听器函数进行包装装饰，返回包装后的函数
    pipes?: FastListenerPipe[]
}
```

| 参数 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `count` | `number` | 0 | 触发次数限制，0表示无限制 |
| `prepend` | `boolean` | `false` | 是否将监听器添加到监听器队列开头 |
| `pipes` | `FastListenerPipe[]` |  | 监听器管道 |
| `filter` | `(message,args) => boolean` |  | 过滤器函数，返回`true`表示通过，`false`表示不通过 |
| `off` | `(message,args) => boolean` |  | 自动取消订阅条件，用于在接收到满足条件的消息时自动取消订阅 | 

## 返回值

返回 `FastEventSubscriber` 对象，包含以下属性：

```ts
interface FastEventSubscriber {
    off: () => void; // 取消监听的方法
    listener: FastEventListener; // 注册的监听器函数
}
```