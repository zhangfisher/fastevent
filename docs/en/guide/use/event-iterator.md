# Async Event Iterator

## Overview

When `on/onAny` is called without specifying a valid listener function, it returns an async event iterator `FastEventIterator`, allowing you to subscribe to events via `for await (const messages of emitter.on(<event>))`.

```typescript
import { FastEvent } from "@fastevent/core";

const emitter = new FastEvent();
// Emit an event
emitter.emit("user/login", { userId: 123 });
// Subscribe to an event
for await (const message of emitter.on("user/login")) {
    console.log("User login:", message.payload);
}
```

## Guide

### Pull Mode

Unlike subscribing to events via a regular listener, consuming event messages with an async event iterator is a classic pull pattern.

- Regular event subscription is a push model: the event emitter (the producer) pushes event messages to subscribers (the consumers).
- Consuming event messages with an async event iterator is a pull model: subscribers actively pull messages themselves.

![](./iterator.drawio.png)

### Buffer

When returning an async iterator (i.e. in pull mode), a `FastEventIterator` is created for each subscriber, and a `FIFO` message buffer is automatically created internally.
Event consumers pull messages from the buffer via `for await`.

The default message buffer parameters are as follows:

```ts
{
    overflow: "slide",
    size: 20,
    maxExpandSize: 100,
    expandOverflow
}
```

- The default buffer size is `size=20`.
- When the buffer overflows, the default `overflow=expand` means the buffer is automatically expanded up to `maxExpandSize=100`.
- Once expanded to `maxExpandSize=100`, the oldest message is removed according to `expandOverflow=slide`.

### Message Lifetime

After a message is placed into the buffer, you can configure the `lifetime` parameter to specify the maximum lifetime of a message in the buffer. When it is exceeded, the message is automatically dropped.

```ts
const messages = emitter.on("count", {
    iterator: {
        // Maximum lifetime of 1 minute; dropped automatically when exceeded
        lifetime: 60 * 1000, // [!code ++]
    },
});
```

### Unsubscribing

An async iterator subscription can be unsubscribed in the following ways:

- **Cancel by passing in an `AbortSignal`**

```ts
const abortController = new AbortController();
const messages = emitter.on("count", {
    iterator: {
        signal: abortController.signal, // [!code ++]
    },
});
setTimeout(() => {
    abortController.abort();
});
for await (const message of messages) {
    console.log(message);
}
```

- Automatically unsubscribed when the `for await` iteration ends

During the `for await` iteration, executing `return`, `break`, or throwing an error will automatically unsubscribe.

```ts
const abortController = new AbortController();
const messages = emitter.on("count");

for await (const message of messages) {
    console.log(message);
    // 1. Exit the async iteration by throwing an error
    throw new Error("Trigger an error");
    // 2. Break the loop
    break;
    // 3. Return
    return;
}
// Automatically unsubscribed after exiting the iteration
```

### Configuration Parameters

```ts
export interface FastEventIteratorOptions<T = FastEventMessage> {
    /** Default buffer size (default: 20) */
    size?: number;
    /** How large the buffer may expand to before it stops expanding (default: 100) */
    maxExpandSize?: number;
    /** Overflow policy after expanding to the maximum size (default: 'slide') */
    expandOverflow?: Omit<FastQueueOverflows, "expand">;
    /** Overflow policy (default: 'slide') */
    overflow?: FastQueueOverflows;
    /** Message lifetime (in milliseconds); 0 means disabled (default: 0) */
    lifetime?: number;
    /** Triggered when a new message arrives */
    onPush?: (newMessage: T, messages: [T, number][]) => void;
    /** Triggered when a message is popped; you can sort the message queue here */
    onPop?: (messages: [T, number][], hasNew: boolean) => [T, number] | undefined;
    /** Triggered when a message is dropped */
    onDrop?: (message: T) => void;
    /** Error handler; returning true continues iteration, false stops iteration */
    onError?: (error: Error) => boolean | Promise<boolean>;
    /** Signal used to cancel the iteration */
    signal?: AbortSignal;
}
```
