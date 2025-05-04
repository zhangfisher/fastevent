# Event Subscription

FastEvent provides a powerful and flexible event subscription system supporting multiple subscription patterns and matching modes. You can use simple APIs to listen to specific events, one-time events, or all events, and also use wildcards to match multiple events.

## Quick Start

### Basic Subscription

```typescript
import { FastEvent } from '@fastevent/core';

const event = new FastEvent();

// Subscribe to specific event
event.on('user/login', (message) => {
    console.log('User login:', message.payload);
});

// Emit event
event.emit('user/login', { userId: 123 });
```

### One-time Subscription

```typescript
// Listen to event only once
event.once('notification', (message) => {
    console.log('Notification received:', message.payload);
});
```

### Using Wildcards

```typescript
// Listen to all user-related events
event.on('user/*', (message) => {
    console.log('User event:', message.type, message.payload);
});

// Listen to all events
event.onAny((message) => {
    console.log('Global event:', message.type, message.payload);
});
```

## Guide

### Event Listeners

When subscribing to events, you need to provide an event listener function to receive event messages. The listener function signature is:

```ts
type FastEventListener = (
    message: FastEventMessage, // Event message
    args: FastEventListenerArgs, // Event message arguments
) => any | Promise<any>;
```

- `FastEventListener` is a regular function type that can be synchronous or asynchronous, receiving an event message object as parameter and returning any type.

#### Context (Execution Context)

The listener's `this` context defaults to the `FastEvent` instance:

```typescript
const emitter = new FastEvent();
emitter.on('event', function (this, message, args) {
    this === emitter; // true // [!code ++]
});
```

You can override the default context by specifying the `context` property when creating the `FastEvent` instance:

```typescript
const emitter = new FastEvent(
    context: 100
);
emitter.on('event', function (this, message, args) {
    this === 100; // true // [!code ++]
});
```

#### Event Message Format

FastEvent uses standardized message format for all events to ensure consistency and extensibility.

All event listeners receive a standardized message object `FastEventMessage`:

```typescript
interface FastEventMessage<T = string, P = any, M = Record<string, unknown>> {
    type: T; // Event type identifier
    payload: P; // Event data payload
    meta: M; // Event metadata
}
```

- **Field Details**

| Field     | Type                      | Description          |
| --------- | ------------------------- | ------------------- |
| `type`    | `string`                  | Event name          |
| `payload` | `any`                     | Event data payload  |
| `meta`    | `Record<string, unknown>` | Event metadata      |

- **Message Extension**

`FastEvent` uses `FastEventMessage` as the message object. You can extend the message object using the `FastEventMessageExtends` interface:

```typescript
declare module 'fast-event' {
    interface FastEventMessageExtends {
        // Custom fields
    }
}
```

#### Listener Arguments

`FastEvent` supports passing arguments when subscribing, which are passed to listeners to control their behavior:

```typescript twoslash
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();
// @noErrors
emitter.on(
    'event',
    (message, args) => {
        //    ^^^^
    },
    {
        // Event listener arguments
    },
);
```

`args` is an object containing these fields:

```ts
type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Record<string, any> & Partial<M>;
    abortSignal?: AbortSignal; // For passing to listener functions
    executor?: FastListenerExecutorArgs;
};
```

### Subscription Methods

#### Basic Subscription - on

The `on()` method is the most basic subscription method for listening to specific event types:

```typescript
event.on(type, listener, options?);
```

Parameter description:

- `type`: Event type, supporting these formats:
  - Regular string: `'user/login'`
  - Single-level wildcard: `'user/*'` (matches one level)
  - Multi-level wildcard: `'user/**'` (matches multiple levels)
  - Global listener: `'**'`
- `listener`: Event listener function receiving event message object
- `options`: Optional configuration
  - `count`: Trigger count limit, 0 means unlimited
  - `prepend`: Whether to prepend listener to queue
  - `filter`: Event filter function

```typescript
// Basic usage
event.on('chat/message', (message) => {
    console.log('Message received:', message.payload);
});

// Using options
event.on(
    'user/login',
    (message) => {
        console.log('User login:', message.payload);
    },
    {
        count: 3, // Trigger only 3 times
        prepend: true, // Prepend to listener queue
    },
);

// Using filter
event.on(
    'data/update',
    (message) => {
        console.log('Data updated:', message.payload);
    },
    {
        filter: (message) => message.payload.important === true,
    },
);
```

#### One-time Subscription - once

The `once()` method creates a listener that triggers only once. This is a special case of `on()`, equivalent to setting `options.count = 1`.

```typescript
event.once('server/start', (message) => {
    console.log('Server started:', message.payload);
});
```

#### Subscribe All Events - onAny

The `onAny()` method listens to all events, shorthand for `on('**')`.

```typescript
event.onAny((message) => {
    console.log('Event type:', message.type);
    console.log('Event data:', message.payload);
});
```

### Default Listener

When using `on/once/onAny` to subscribe to events, you can omit the listener function, in which case the default listener `onMessage` will be used.

```typescript
const emitter = new FastEvent();
// Default listener
emitter.onMessage = (message) => {
    console.log('Event received:', message.type);
};
// Subscribe events to default listener
emitter.on('user/login');
emitter.once('user/logout');
emitter.onAny();
```

`onMessage` is typically used more for class inheritance:

```ts
class MyEmitter extends FastEvent {
    onMessage(message) {
        console.log('Event received:', message.type);
    }
}
const emitter = new MyEmitter();
// Subscribe events to default listener
emitter.on('user/login');
emitter.once('user/logout');
emitter.onAny();
```

### Wildcard Matching

FastEvent supports two types of wildcards:

1. **Single-level wildcard (`*`): Matches single-level paths**

```typescript
// Matches user/login, user/logout etc.
event.on('user/*', (message) => {
    console.log('User action:', message.type);
});
```

2. **Multi-level wildcard (`**`): Matches multi-level paths**

```typescript
// Matches user/profile/update, user/settings/theme/change etc.
event.on('user/**', (message) => {
    console.log('User-related event:', message.type);
});
```

`**` can match any number of path levels, but **only works at the end of event names**.

```typescript
event.on('user/**', listener); // ✅ Valid
event.on('user/**/login', listener); // ❌ Invalid
```

### Event Retention

`FastEvent` supports event retention (`retain`) feature, allowing new subscribers to immediately receive the last retained event:

```typescript
// Emit and retain event
event.emit('status/update', { online: true }, true); // Third parameter true means retain event

event.emit(
    'status/update',
    { online: true },
    {
        retain: true, // Retain event [!code++ ]
    },
);

// Subsequent subscribers immediately receive retained event
event.on('status/update', (message) => {
    console.log('Current status:', message.payload); // Immediately outputs: Current status: { online: true }
});
```

### Subscription Count

`FastEvent` supports the `count` parameter to limit listener execution count. When the count is reached, the subscription is automatically removed:

```ts
event.on('status/update', listener, { count: 3 }); // Trigger only 3 times
```

:::warning Note
`event.once` is a special case of `on()`, equivalent to `on(event,listener,{count:1})`
:::

### Listener Priority

By default, listeners are appended to the queue in subscription order. You can use the `prepend` parameter to insert listeners at the head of the queue:

```ts
event.on('event', () => 1); // Default append to queue tail
event.on('event', () => 2, { prepend: true }); // Insert at queue head

event.emit('event'); // Output: 2 1
```

### Event Filtering

`FastEvent` supports the `filter` parameter to filter events - only events passing the filter will trigger:

```ts
event.on('event', (message) => {}, {
    filter: (message, args) => message.payload.userId === '123',
});
```

### Type Safety

FastEvent fully supports TypeScript. You can define event types for complete type checking:

```typescript
interface MyEvents {
    'user/login': { userId: string; timestamp: number };
    'user/logout': { userId: string };
}

const event = new FastEvent<MyEvents>();

// Type-safe event subscription
event.on('user/login', (message) => {
    // message.payload type is { userId: string; timestamp: number }
    console.log(`User ${message.payload.userId} logged in at ${message.payload.timestamp}`);
});
```