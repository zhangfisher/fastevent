# Event Triggering

FastEvent provides a flexible and powerful event triggering mechanism that supports various triggering methods and options.

## Event Triggering Methods

The `emit` or `emitAsync` methods are used for synchronous or asynchronous event triggering.

### Basic Triggering Method

The simplest way to trigger an event is using `event type` and `data payload` as parameters:

```typescript
const events = new FastEvent();

// Trigger simple event
emitter.emit('user/login', { id: 1, name: 'Alice' });
await emitter.emitAsync('user/login', { id: 1, name: 'Alice' });

// Trigger event and retain event message
emitter.emit(
    'user/login',
    { id: 1, name: 'Alice' }, // Event data
    true, // Whether to retain
);
await emitter.emitAsync(
    'user/login',
    { id: 1, name: 'Alice' }, // Event data
    true, // Whether to retain
);
```

### Message Object Form

You can also trigger events using a message object, which provides more flexibility:

```typescript
emitter.emit({
    type: 'user/login', // Event type
    payload: { id: 1, name: 'Alice' }, // Event data payload
    meta: { timestamp: Date.now() }, // Optional metadata
});
await emitter.emitAsync({
    type: 'user/login', // Event type
    payload: { id: 1, name: 'Alice' }, // Event data payload
    meta: { timestamp: Date.now() }, // Optional metadata
});
```

## Guidelines

### Event Trigger Results

`emit` and `emitAsync` execute registered listener functions and return their results when triggering events.

```typescript
emitter.on('event', () => 1);
emitter.on('event', () => 2);
emitter.on('event', () => 3);

const result = emitter.emit('event'); // [1, 2, 3]
const result = await emitter.emitAsync('event'); // [1, 2, 3]
```

### Call Count Limit

When triggering events, you can limit the maximum number of times a listener is called:

```typescript
// Remove listener after maximum of 3 calls
emitter.on('event', handler, { count: 3 });

// Equivalent once syntax sugar
emitter.on('event', handler, { count: 1 });
// Same as
emitter.once('event', handler);
```

### Prepend Insertion

By default, when registering listeners using `on/once`, the listener is added to the end of the queue. Enabling `prepend=true` will add the listener to the beginning of the queue instead of the end, affecting the execution order of listeners.

```typescript
emitter.on('event', handler1);
emitter.on('event', handler2, { prepend: true });
// Execution order: handler2 -> handler1
```

### Retained Events

Setting `retain=true` retains events for subsequent subscribers:

```typescript
// Trigger and retain event
emitter.emit('system/status', { online: true }, true);
// Equivalent to: emitter.emit('system/status', { online: true }, { retain: true })

// Subsequent subscribers will immediately receive the retained event
emitter.on('system/status', (message) => {
    console.log('Current status:', message.payload.online);
});
```

### Return Results

`emit` and `emitAsync` execute registered listener functions and return their results when triggering events.

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

// Trigger async event and wait for all listeners to complete
// @noErrors
const results = await emitter.emitAsync('event');
//    ^^^^^^^
// results === [1, 2, 3]
// @noErrors
const results = emitter.emit('event');
//    ^^^^^^^
// results === [1, 2, 3]
```

### Error Handling

When async listener functions throw errors, the `emit/emitAsync` return results will include `Error` objects.

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

// Trigger async event and wait for all listeners to complete
const results = await emitter.emitAsync('event');
// results === [1,
//              Error('custom error'),   // [!code ++]
//             3]
```

### Triggering with Metadata

Additional metadata can be specified when triggering events to pass to listeners.

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

-   `message.meta` is an object containing additional metadata.
-   Types of metadata specified during `emit` cannot be automatically inferred.
-   For more information about metadata, see [Metadata](./metadata).

### Type-Safe Event Triggering

When using `TypeScript`, `FastEvent` provides complete type checking:

```typescript
import { FastEvent } from 'fastevent';

interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
    'system/error': { code: string; message: string };
}

const emitter = new FastEvent<MyEvents>();

emitter.onAny<number>((message) => {});

// ✅ Correct: Data type matches
emitter.emit('user/login', { id: 1, name: 'Alice' });

// ✅ Correct: Message object
emitter.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
});
// ✅ Correct: Supports triggering undefined event types
emitter.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
// ✅ Correct: Supports triggering undefined event types
emitter.emit('xxxx', 1);

// ❌ Error: Declared event type payload doesn't match
events.emit('user/login', { id: '1', name: 'Alice' }); // TypeScript error
events.emit('user/login', 1); // TypeScript error
events.emit('order', '1');
// ❌ Error: id type doesn't match
events.emit({
    type: 'user/login',
    payload: { id: '1', name: 'Alice' },
});
```

**The first generic parameter of `FastEvent` is used to declare event types:**

```typescript
interface MyEvents {
    [EventTypeName]: <EventMessagePayloadType>
}
const events = new FastEvent<MyEvents>();
```

:::warning Note
In the example above, we declared the `MyEvents` interface, why is the following type correct?

```ts
emitter.emit({
    type: 'xxxxx',
    payload: { id: 1, name: 'Alice' },
});
```

Because `FastEvent.emit` provides multiple different function call signatures, when `type` is `string`, `payload` is inferred as `any`, so the `emit` function call is correct.
:::

## API

### emit

`emit` supports multiple calling methods, with the following function signatures:

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

The rich call signatures of `emit` above can be broadly categorized into the following situations:

-   **Trigger events by specifying `type` and `payload`**

```typescript
emitter.emit('click', 100);
emitter.emit('click', 100, true); // Retain message
emitter.emit('click', 100, { retain: true }); // Retain message
emitter.emit('click', 100, { ... }); // Carry additional trigger parameters
```

-   **Trigger events by specifying `message`**

```typescript
emitter.emit({ type: 'click', payload: 100 });
// Retain message
emitter.emit({ type: 'click', payload: 100 }, true);
// Retain message
emitter.emit({ type: 'click', payload: 100 }, { retain: true });
// Carry additional trigger parameters
emitter.emit({ type: 'click', payload: 100 }, { retain: true, .... });
```

### emitAsync

`emitAsync` is the asynchronous version of `emit`, implemented as follows:

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

It is used in the same way as `emit`, with the difference being that it internally calls `Promise.allSettled` and returns `Promise<[R | Error][]>`.

### Trigger Parameters

The `emit/emitAsync` methods allow passing additional parameters that control event triggering behavior.

```typescript
export type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Record<string, any> & Partial<M>;
    abortSignal?: AbortSignal; // Used to pass to listener functions
    executor?: FastListenerExecutorArgs;
};
```

| Parameter Name | Type                       | Description                                                                                     |
| ------------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| `retain`      | `boolean`                  | Whether to retain the message. If true, the last message is retained. See [Retained Messages](./retain-messages.md) |
| `meta`        | `Record<string, any>`      | Event metadata, passed to listeners                                                             |
| `abortSignal` | `AbortSignal`             | Used to pass to listener functions. See [Aborting Listeners](./abort.md)                        |
| `executor`    | `FastListenerExecutorArgs` | Used to control listener execution behavior. See [Executor](./executor.md)                      |