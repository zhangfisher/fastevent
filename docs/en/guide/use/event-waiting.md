# Event Waiting Mechanism

FastEvent provides a powerful `waitFor` method that allows asynchronously waiting for specific events to occur.

## Basic Usage

### Waiting for Events

```typescript
// Wait for event to occur
const message = await emitter.waitFor('system/ready');
console.log('System ready:', message.payload);
```

### Waiting with Timeout

```typescript
try {
    const message = await emitter.waitFor('user/login', 5000);
    console.log('User login:', message.payload);
} catch (err) {
    console.log('Waiting for user login timed out');
}
```

## Advanced Usage

### Conditional Waiting

```typescript
// Wait for admin login
const adminLogin = await emitter.waitFor('user/login', {
    timeout: 10000,
    filter: (msg) => msg.payload.role === 'admin',
});
```

### Waiting for Retained Events

```typescript
// Trigger and retain event
emitter.emit('config/loaded', config, true);

// Can receive immediately even when listening later
const configMsg = await emitter.waitFor('config/loaded');
```

## Type Safety

```typescript
interface AppEvents {
    'user/login': { id: string; role: string };
    'data/ready': { items: string[] };
}

const emitter = new FastEvent<AppEvents>();

// Return type automatically inferred
const loginMsg = await emitter.waitFor('user/login');
// loginMsg type is { type: 'user/login'; payload: { id: string; role: string } }

const dataMsg = await emitter.waitFor('data/ready', 3000);
// dataMsg type is { type: 'data/ready'; payload: { items: string[] } }
```

## Use Cases

### Initialization Order Control

```typescript
async function initialize() {
    await emitter.waitFor('db/connected');
    await emitter.waitFor('config/loaded');
    await emitter.waitFor('services/ready');
    startApplication();
}
```

### Test Verification

```typescript
test('user login flow', async () => {
    // Mock login
    setTimeout(() => emitter.emit('user/login', testUser), 100);

    // Wait for login event
    const message = await emitter.waitFor('user/login');
    expect(message.payload.id).toBe(testUser.id);
});
```

## Important Notes

1. **Timeout Handling**: Always consider setting reasonable timeout periods
2. **Memory Leaks**: Uncompleted waitFor calls maintain references
3. **Race Conditions**: Ensure events will actually occur
4. **Performance Impact**: Large numbers of waits may affect performance
5. **Error Handling**: Catch potential timeout errors

## Comparison with once

| Feature        | waitFor                                | once                        |
| -------------- | -------------------------------------- | --------------------------- |
| Execution      | Asynchronous (Promise)                 | Synchronous                 |
| Return Value   | Event message                          | None                        |
| Timeout        | Supported                              | Not supported               |
| Use Cases      | Scenarios requiring wait and timeout   | Simple one-time logic      |

```typescript
// waitFor is better for async flow control
async function setup() {
    try {
        await emitter.waitFor('db/ready', 5000);
        startApp();
    } catch {
        showTimeoutError();
    }
}

// once is better for simple one-time logic
emitter.once('first-render', initAnalytics);
```