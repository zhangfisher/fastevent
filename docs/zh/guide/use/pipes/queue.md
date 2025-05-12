# Queue

将监听器接收到的消息放入消息队列中，监听器函数从队列中依次提取消息进行排除处理。



## 使用方法

```typescript
import { queue } from 'fastevent/pipes';

emitter.on(
    'task',
    async (msg) => {
        await processTask(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 5 // 队列大小=5 // [!code ++]
            })], 
    },
);
```

## 配置参数

`queue(optins)`支持以下参数：

| 参数 | 类型 | 默认值| 描述 |
| --- | --- | --- | --- |
| `size` | `number` | `10` | 队列大小 |
| `overflow` | `'slide' \| 'drop' \| 'throw' \| 'expand'` | `'slide'` | 队列满时的处理策略 |
| `expandOverflow` | `'slide' \| 'drop' \| 'throw'` | `'slide'` | 扩展策略(当 `overflow=expand`时使用) |
| `maxExpandSize` | `number` | `100` | 最大扩展大小 |
| `onEnter` | `(newMsg, queuedMsgs) => void` |  | 新消息入列时的回调函数 |
| `onDrop` | `(msg) => void` |  | 当新消息被丢弃时的回调函数 |
| `lifetime` | `number` | | 指定消息在队列中保存的最大时长(毫秒)，超过会丢弃。 |

## 溢出处理

`overflow`参数用于指定队列满时的处理策略，可选值如下：

| 值 | 描述 |
| --- | --- |
| `slide` | 丢弃最早的消息 |
| `drop` | 丢弃新消息 |
| `throw` | 抛出异常 |
| `expand` | 扩展队列，每次扩展`size`，最大`maxExpandSize` |

重点说一下`expand`策略，当队列满时，会扩展队列，每次扩展`size`，最大`maxExpandSize`。
如果队列已经达到`maxExpandSize`，则由`expandOverflow`参数指定处理策略。
 

## 入列回调

`onEnter`参数用于指定新消息入列时的回调函数，该函数会在新消息入列时被调用。

`onEnter`参数:

| 参数 | 类型 | 描述 |
| --- | --- | --- |
| `newMsg` | `any` | 新消息 |
| `queuedMsgs` | `any[]` | 队列中的消息 |

`onEnter`回调可以在入列时对消息队列进行处理。

下例是根据**按优先级处理消息**的示例：

```typescript {9-15}
import { queue } from 'fastevent/pipes';
emitter.on("test", async (msg) => {
    await delay(first ? 500 : 10)  // 每个消息处理时间相同
    first = false
    results.push(msg.payload)
}, {
    pipes: [queue({
        size: 5,
        onEnter: (newMsg, queuedMsgs) => {
            // 根据priority排序，高优先级（数字大）的排在前面
            const insertIndex = queuedMsgs.findIndex(
                msg => (msg[0].meta.priority ?? 0) < (newMsg.meta.priority ?? 0)
            )
            queuedMsgs.splice(insertIndex, 0, [newMsg, 0])
        }
    })]
})

// 发送不同优先级的消息
const promises = [
    ...emitter.emit("test", 1, { meta: { priority: 1 } }),   //  
    ...emitter.emit("test", 2, { meta: { priority: 1 } }),   //  低
    ...emitter.emit("test", 3, { meta: { priority: 3 } }),   //  
    ...emitter.emit("test", 4, { meta: { priority: 2 } }),   //  
    ...emitter.emit("test", 5, { meta: { priority: 5 } }),   //  
    ...emitter.emit("test", 6, { meta: { priority: 4 } }),   //  高
]

return new Promise<void>(resolve => {
    vi.runAllTimersAsync()
    Promise.all(promises).then(() => {
        // 验证消息按优先级顺序处理： 
        // 第1条消息因为还没有入列，所以先得到处理
        expect(results).toEqual([1, 5, 6, 3, 4, 2])
    }).finally(() => {
        resolve()
    })
})
```

:::warning 提示
`onEnter`回调一般用于对队列进行重新处理，如排序，分组等。
:::


## 丢弃消息

提供`drop`回调参数，在消息被丢弃时调用。

```typescript
// 自定义重试配置
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            queue(100, { 
                drop: (msg, error) => {// [!code ++]
                   // // [!code ++] 
                }, // [!code ++]
            }),
        ],
    },
);
```

## 默认参数

`queue`的默认参数如下：

| 参数 | 值 |
| --- | --- |
| `size` | `10` |
| `overflow` | `'slide'` |
| `expandOverflow` | `'slide'` |
| `maxExpandSize` | `100` |


## 快捷方式

`Queue`提供了以下几个快捷方式

### dropping

队列溢出丢弃

```ts
export const dropping = (size: number = 10) => queue({ size, overflow: 'drop' })
```

### sliding

队列溢出时丢弃最早的消息

```ts
export const sliding = (size: number = 10) => queue({ size, overflow: 'slide' })
```

### expanding

队列溢出时自动扩展队列

```ts
export const expanding = (options?: Omit<QueueListenerPipeOptions, 'overflow'>) => queue(Object.assign({}, options, { overflow: 'expand' as QueueListenerPipeOptions['overflow'] }))
```