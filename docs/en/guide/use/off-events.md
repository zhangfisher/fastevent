# Unsubscribing from Events

FastEvent provides a flexible event unsubscription mechanism that supports multiple cancellation methods. You can unsubscribe from specific events, specific listeners, or all subscriptions. It also supports cleaning up subscriptions by scope and clearing retained events.

## Quick Start

### Unsubscribe Using Subscription Object

```typescript
// Save the subscription object returned when subscribing to events
const subscriber = event.on('user/login', (message) => {
    console.log('User login:', message.payload);
});

// Unsubscribe using the subscription object
subscriber.off();
```

:::warning Recommended
Using subscription objects for unsubscribing is recommended to avoid unintended operations
:::

### Unsubscribe Using off Method

```typescript
const listener = (message) => {
    console.log('Received message:', message.payload);
};

// Subscribe to event
event.on('chat/message', listener);

// Unsubscribe specific listener from specific event
event.off('chat/message', listener);
```

### Unsubscribe All

```typescript
// Unsubscribe from all events
event.offAll();
```

## Guide

### Subscriber

The `on/once/onAny` methods return a subscription object:

```ts
export type FastEventSubscriber = {
    off: () => void;
    listener: FastEventListener<any, any, any>;
};
```

Using subscription objects for unsubscribing is recommended to avoid unintended operations:

```ts
const subscriber = event.on('chat/message', listener);
subscriber.off(); // [!code ++]
```

### off Method

The `off()` method is the basic unsubscription method, supporting multiple calling patterns:

1. **Unsubscribe specific listener from specific event:**

```typescript
const subscriber = event.on('chat/message', listener);
event.off('chat/message', subscriber.listener);
```

**Special Note:**
The above method might not unsubscribe as expected because the `listener` function might be wrapped internally, making the `off()` method unable to unsubscribe.
Prefer using the following method for unsubscribing:

```ts
const subscriber = event.on('chat/message', listener);
subscriber.off(); // [!code ++]
```

Or you can use:

```
const subscriber = event.on('chat/message', listener);
event.off('chat/message',
    subscriber.listener // [!code ++]
);
```

2. **Unsubscribe all listeners for a specific event:**

```typescript
event.off('chat/message');
```

3. **Unsubscribe specific listener from all event subscriptions:**

```typescript
event.off(listener);
```

### offAll Method

The `offAll()` method is used for batch unsubscription, supporting an optional prefix parameter:

1. Unsubscribe from all events:

```typescript
event.offAll();
```

2. Unsubscribe from all events with a specific prefix:

```typescript
// Unsubscribe from all events starting with 'user/'
event.offAll('user');
```

Features:

-   Clears all listeners within the specified range
-   Does not affect listeners in other ranges
-   Suitable for batch cleaning of event subscriptions for specific modules or features

### clear Method

The `clear()` method not only unsubscribes but also clears retained events:

```typescript
// Clear all subscriptions and retained events
event.clear();

// Clear subscriptions and retained events with specific prefix
event.clear('user');
```

Features:

-   Clears both subscriptions and retained events
-   Supports clearing by prefix
-   Suitable for completely resetting the event system within a specific range

:::warning Note
The difference between `clear` and `offAll` is that `clear` also removes retained event messages, while `offAll` does not.
:::

### Automatic Unsubscription

FastEvent supports specifying an `off` parameter when subscribing, which automatically unsubscribes when receiving messages that meet certain conditions.

```ts
import { FastEvent } from 'fastevent';

const emitter = new FastEvent();

emitter.on(
    'click',
    (message, args) => {
        console.log(message);
    },
    {
        off: (message, args) => {
            return message.payload === 'exit'; //   [!code ++]
        },
    },
);
emitter.emit('click', '1');
emitter.emit('click', 'exit');
```

-   In the example above, the subscription will automatically be cancelled when receiving a message with `payload=exit`.