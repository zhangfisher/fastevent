# One-time Events

FastEvent provides a convenient one-time event listening mechanism that ensures listeners are automatically removed after being invoked once.

## Basic Usage

### Standard Approach

```typescript
emitter.once('user/login', (message) => {
    console.log('User login (first time):', message.payload);
});
```

### With Options

```typescript
emitter.once('user/login', handler, {
    context: authService, // execution context
    priority: 10, // priority
});
```

## Type Safety Example

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'system/ready': void;
}

const emitter = new FastEvent<AppEvents>();

// Type check passes
emitter.once('user/login', (message) => {
    console.log(message.payload.userId); // ✅
});

// Type error
emitter.once('user/login', (message) => {
    console.log(message.payload.nonExist); // ❌
});
```

## Use Cases

### Initialization Logic

```typescript
// Execute only once when the system is ready
emitter.once('system/ready', initializeApp);
```

### Waiting for First User Interaction

```typescript
// Listen for the user's first click
emitter.once('ui/first-click', setupTutorial);
```

### Resource Loading

```typescript
// Ensure configuration is loaded only once
emitter.once('config/loaded', cacheConfig);
```

## Advanced Usage

### Conditional One-time Listener

```typescript
// Trigger only once when the condition is met
emitter.once('data/update', handler, {
    filter: (msg) => msg.payload.version > 1,
});
```

### Combined Usage

```typescript
emitter.once(
    'order/complete',
    (message) => {
        console.log('Order completed:', message.payload);
    },
    {
        context: orderService,
        priority: 100,
    },
);
```

## Caveats

1. **Performance**: There is additional overhead compared to regular listeners.
2. **Race Conditions**: Ensure the event will actually be emitted.
3. **Memory Management**: Untriggered one-time listeners also consume memory.
4. **Alternatives**: Consider using `waitFor` for asynchronous scenarios.

## Comparison with waitFor

| Feature   | once                     | waitFor                            |
| --------- | ------------------------ | ---------------------------------- |
| Execution | Synchronous              | Asynchronous (Promise)             |
| Timeout   | Not supported            | Supports timeout configuration      |
| Return    | None                     | Returns the event message          |
| Use Case  | Simple one-time logic    | Scenarios requiring wait and timeout control |

```typescript
// once example
emitter.once('ready', () => console.log('Ready'));

// waitFor example
try {
    const message = await emitter.waitFor('ready', 5000);
    console.log('Ready:', message);
} catch {
    console.log('Timed out');
}
```
