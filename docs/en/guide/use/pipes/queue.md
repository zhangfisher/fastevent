# Queue

Places messages received by the listener into a message queue, and the listener function extracts messages from the queue for sequential processing.

## Usage

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
                size: 5 // Queue size=5 // [!code ++]
            })], 
    },
);
```

## Configuration Parameters

`queue(options)` supports the following parameters:

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `number` | `10` | Queue size |
| `overflow` | `'slide' \| 'drop' \| 'throw' \| 'expand'` | `'slide'` | Strategy when queue is full |
| `expandOverflow` | `'slide' \| 'drop' \| 'throw'` | `'slide'` | Expansion strategy (used when `overflow=expand`) |
| `maxExpandSize` | `number` | `100` | Maximum expansion size |
| `onPush` | `(newMsg, queuedMsgs) => void` |  | Callback function when a new message enters the queue |
| `onDrop` | `(msg) => void` |  | Callback function when a new message is dropped |
| `lifetime` | `number` | | Specifies the maximum time (in milliseconds) a message is kept in the queue, after which it will be discarded. |

## Overflow Handling

The `overflow` parameter specifies the strategy when the queue is full, with the following options:

| Value | Description |
| --- | --- |
| `slide` | Discard the oldest message |
| `drop` | Discard the new message |
| `throw` | Throw an exception |
| `expand` | Expand the queue, each time by `size`, up to `maxExpandSize` |

Let's focus on the `expand` strategy: when the queue is full, it will expand by `size` each time, up to `maxExpandSize`.
If the queue has already reached `maxExpandSize`, the strategy specified by `expandOverflow` will be used.

## Queue Entry Callback

The `onPush` parameter specifies a callback function when a new message enters the queue.

`onPush` parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `newMsg` | `any` | New message |
| `queuedMsgs` | `any[]` | Messages in the queue |

The `onPush` callback can process the message queue when a new message enters.

Here's an example of **processing messages by priority**:

```typescript {9-15}
import { queue } from 'fastevent/pipes';
emitter.on("test", async (msg) => {
    await delay(first ? 500 : 10)  // Each message has the same processing time
    first = false
    results.push(msg.payload)
}, {
    pipes: [queue({
        size: 5,
        onPush: (newMsg, queuedMsgs) => {
            // Sort by priority, higher priority (larger number) comes first
            const insertIndex = queuedMsgs.findIndex(
                msg => (msg[0].meta.priority ?? 0) < (newMsg.meta.priority ?? 0)
            )
            queuedMsgs.splice(insertIndex, 0, [newMsg, 0])
        }
    })]
})

// Send messages with different priorities
const promises = [
    ...emitter.emit("test", 1, { meta: { priority: 1 } }),   //  
    ...emitter.emit("test", 2, { meta: { priority: 1 } }),   //  Low
    ...emitter.emit("test", 3, { meta: { priority: 3 } }),   //  
    ...emitter.emit("test", 4, { meta: { priority: 2 } }),   //  
    ...emitter.emit("test", 5, { meta: { priority: 5 } }),   //  
    ...emitter.emit("test", 6, { meta: { priority: 4 } }),   //  High
]

return new Promise<void>(resolve => {
    vi.runAllTimersAsync()
    Promise.all(promises).then(() => {
        // Verify messages are processed in priority order: 
        // The 1st message is processed first because it hasn't entered the queue yet
        expect(results).toEqual([1, 5, 6, 3, 4, 2])
    }).finally(() => {
        resolve()
    })
})
```

:::warning Note
The `onPush` callback is generally used to reprocess the queue, such as sorting, grouping, etc.
:::

## Discarding Messages

Provide a `drop` callback parameter that is called when a message is discarded.

```typescript
// Custom retry configuration
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

## Default Parameters

The default parameters for `queue` are:

| Parameter | Value |
| --- | --- |
| `size` | `10` |
| `overflow` | `'slide'` |
| `expandOverflow` | `'slide'` |
| `maxExpandSize` | `100` |

## Shortcuts

`Queue` provides the following shortcuts:

### dropping

Drop new messages when queue overflows

```ts
export const dropping = (size: number = 10) => queue({ size, overflow: 'drop' })
```

### sliding

Drop oldest messages when queue overflows

```ts
export const sliding = (size: number = 10) => queue({ size, overflow: 'slide' })
```

### expanding

Automatically expand the queue when it overflows

```ts
export const expanding = (options?: Omit<QueueListenerPipeOptions, 'overflow'>) => queue(Object.assign({}, options, { overflow: 'expand' as QueueListenerPipeOptions['overflow'] }))
```