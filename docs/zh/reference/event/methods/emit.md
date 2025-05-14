# emit

同步触发指定事件。

## 方法签名

共提供`8`个重载签名，其中 `T` 为事件类型，`Events` 为事件对象，`Meta` 为元数据对象。

### 类型安全基本用法

此种方法可以根据构建`FastEvent`时提供的事件泛型参数推断事件类型。

```ts
//
emit<R = any, T extends Types = Types>(
    type: T,
    payload?: Events[T],
    options?: FastEventListenerArgs<Meta>
): R[]
// 指定retain
emit<R = any, T extends Types = Types>(
    type: T,
    payload?: Events[T],
    retain?: boolean
): R[]

```

-   **示例**

```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent<{
    click: number;
    focus: string;
    blur: boolean;
}>();

emitter.emit('click', 100);
//            ^|
//
//
//
//
```

### 字符串事件类型

直接指定任意字符串事件类型。

```ts
emit<R = any, T extends string = string>(
    type: T,
    payload?: T extends Types ? Events[Types] : any,
    retain?: boolean
): R[]
emit<R = any, T extends string = string>(
    type: T,
    payload?: T extends Types ? Events[Types] : any,
    options?: FastEventListenerArgs<Meta>
): R[]
```

### 类型安全消息对象参数

```ts
emit<R = any, T extends string = string>(
    message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>,
    retain?: boolean
): R[]
emit<R = any, T extends string = string>(
    message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>,
    options?: FastEventListenerArgs<Meta>
): R[]
```

### 消息对象参数

```ts
emit<R = any>(
    message: FastEventEmitMessage<Events, Meta>,
    retain?: boolean
): R[]
emit<R = any>(
    message: FastEventEmitMessage<Events, Meta>,
    options?: FastEventListenerArgs<Meta>
): R[]
```

## 参数

| 参数                  | 类型                       | 描述                                                                                                   |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `type`                | `T`                        | 要触发的事件类型，能自动推断                                                                           |
| `payload`             | `Events[T]`                | 事件负载数据                                                                                           |
| `options`             | `FastEventListenerArgs`    | 是否保留事件数据                                                                                       |
| `options.retain`      | `boolean`                  | 是否保留消息，如果为`true`，则最后一条消息被保留,详见[保留消息](../../../guide/use/retain-messages.md) |
| `options.meta`        | `Record<string, any>`      | 事件元数据，用于传递给监听器                                                                           |
| `options.abortSignal` | `AbortSignal`              | 用于传递给监听器函数,详见[中止监听器](../../../guide/use/abort.md)                                     |
| `options.executor`    | `FastListenerExecutorArgs` | 用于控制监听器执行行为,详见[执行器](../../../guide/use/executors/index)                                    |

## 返回值

`emit`函数返回所有匹配监听器函数的返回值。

```ts
const emitter = new FastEvent<{ click: number }>();

emit.on('click', () => 1)
emit.on('click', () => {throw new Error('custom'))
emit.on('click', async () =>2 )
emit.on('click', async () => {throw new Error('custom'))

const results = emit('click', 100);
// [1,Error,Promise,Promise]

```

-   可以指定一个泛型参数`R`，用于指定监听器函数的返回值类型，`R[]` 为监听器函数的返回值类型，默认为`any[]`。
