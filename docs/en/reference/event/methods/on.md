# on

Register an event listener.

## Method Signature

```ts
// Basic usage
on<T extends Types = Types>(
    type: T,
    listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// String event type
on<T extends string>(
    type: T,
    listener: FastEventAnyListener<Events, Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// Listen to all events globally
on(
    type: '**',
    listener: FastEventAnyListener<Record<string, any>, Meta, Fallback<Context, typeof this>>,
    options?: FastEventListenOptions<Events, Meta>
): FastEventSubscriber

// No-listener version
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

## Parameters

When registering a listener, you can pass a `FastEventListenOptions` object to control the listener's behavior. Available options:

```ts
export type FastEventListenOptions = {
    // Number of times the listener will be invoked. When 1, the listener is invoked once; when 0, it listens permanently; for other values, the listener is invoked that many times, decrementing by one on each execution and removed when it reaches 0.
    count?: number
    // Add the listener to the head of the listener list
    prepend?: boolean
    filter?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // If this function returns true before the listener is invoked, the listener is automatically unsubscribed
    off?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // Wraps and decorates the listener function, returning the wrapped function
    pipes?: FastListenerPipe[]
}
```

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | 0 | Trigger count limit; 0 means unlimited |
| `prepend` | `boolean` | `false` | Whether to add the listener to the head of the listener queue |
| `pipes` | `FastListenerPipe[]` |  | Listener pipes |
| `filter` | `(message,args) => boolean` |  | Filter function; returns `true` to pass, `false` to skip |
| `off` | `(message,args) => boolean` |  | Auto-unsubscribe condition; used to automatically unsubscribe when a message matching the condition is received | 

## Return Value

Returns a `FastEventSubscriber` object with the following properties:

```ts
interface FastEventSubscriber {
    off: () => void; // Method to unsubscribe the listener
    listener: FastEventListener; // The registered listener function
}
```
