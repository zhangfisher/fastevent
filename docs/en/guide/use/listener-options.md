# Listener Options

FastEvent provides rich listener configuration options to flexibly control listening behavior.

## Basic Options

### count (Call Count Limit)

Limits the maximum number of times a listener can be called:

```typescript
// Maximum of 3 triggers
emitter.on('event', handler, { count: 3 });

// Equivalent once syntax sugar
emitter.on('event', handler, { count: 1 });
// Same as
emitter.once('event', handler);
```

### prepend (Prepend Insertion)

Adds the listener to the beginning of the queue instead of the end:

```typescript
emitter.on('event', handler1);
emitter.on('event', handler2, { prepend: true });
// Execution order: handler2 -> handler1
```

### context (Execution Context)

Sets the `this` context for the listener:

```typescript
const service = {
    name: 'myService',
    handle() {
        console.log(this.name); // 'myService'
    },
};

emitter.on('event', service.handle, { context: service });
```

## Advanced Options

### priority (Priority)

Higher numbers indicate higher priority, default is 0:

```typescript
emitter.on('event', handler1, { priority: 10 });
emitter.on('event', handler2, { priority: 5 });
emitter.on('event', handler3);
// Execution order: handler1 -> handler2 -> handler3
```

### filter (Conditional Filtering)

Only calls the listener when conditions are met:

```typescript
emitter.on('event', handler, {
    filter: (message) => message.payload.value > 10,
});
```

### until (Termination Condition)

Automatically removes the listener when the condition is met:

```typescript
emitter.on('event', handler, {
    until: (message) => message.payload.status === 'done',
});
```

## Type Definitions

Type definitions for all listener options:

```typescript
interface FastEventListenOptions {
    count?: number; // Call count limit
    prepend?: boolean; // Whether to prepend insert
    context?: any; // Execution context
    priority?: number; // Priority (0-100)
    filter?: (message: FastEventMessage) => boolean; // Conditional filtering
    until?: (message: FastEventMessage) => boolean; // Termination condition
}
```

## Combined Usage Example

```typescript
emitter.on(
    'order/update',
    (message) => {
        console.log('Order update:', message.payload);
    },
    {
        count: 5, // Process maximum of 5 times
        priority: 80, // High priority
        filter: (msg) => msg.payload.amount > 100, // Only process large orders
        context: orderService, // Specify execution context
    },
);
```