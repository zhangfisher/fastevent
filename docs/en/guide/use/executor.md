# Executor

`FastEvent` provides a flexible executor mechanism to control how event listeners are executed. Executors can determine how multiple listeners are executed, how execution results are handled, and how performance is optimized.

## Built-in Executors

### default (Default Executor)

Executes all registered listeners and returns all results.

```typescript
const emitter = new FastEvent({
    executor: 'default', // Or omit, this is the default value
});

emitter.on('test', () => 'result1');
emitter.on('test', () => 'result2');

const results = emitter.emit('test');
console.log(results); // ['result1', 'result2']
```

### race (Racing Executor)

Returns only the result from the fastest completing listener, particularly suitable for handling asynchronous operations.

```typescript
const emitter = new FastEvent({
    executor: 'race',
});

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'slow';
});

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return 'fast';
});

const results = await emitter.emitAsync('test');
console.log(results); // ['fast']
```

### balance (Load Balancing Executor)

Evenly distributes execution counts among all listeners when triggering events multiple times.

```typescript
const emitter = new FastEvent({
    executor: 'balance',
});

emitter.on('test', () => 'handler1');
emitter.on('test', () => 'handler2');
emitter.on('test', () => 'handler3');

// Each listener will be called roughly equally
for (let i = 0; i < 9; i++) {
    emitter.emit('test');
}
```

### first (First Executor)

Only executes the first registered listener.

```typescript
const emitter = new FastEvent({
    executor: 'first',
});

emitter.on('test', () => 'First');
emitter.on('test', () => 'Second');

const results = emitter.emit('test');
console.log(results); // ['First']
```

### last (Last Executor)

Only executes the last registered listener.

```typescript
const emitter = new FastEvent({
    executor: 'last',
});

emitter.on('test', () => 'First');
emitter.on('test', () => 'Last');

const results = emitter.emit('test');
console.log(results); // ['Last']
```

### random (Random Executor)

Randomly selects one listener to execute.

```typescript
const emitter = new FastEvent({
    executor: 'random',
});

emitter.on('test', () => 'Listener1');
emitter.on('test', () => 'Listener2');
emitter.on('test', () => 'Listener3');

// Each execution will randomly select one listener
const results = emitter.emit('test');
console.log(results); // Randomly returns ['Listener1'] or ['Listener2'] or ['Listener3']
```

## Configuration Levels

FastEvent provides three levels of executor configuration:

### 1. Global Configuration

Configured when creating a FastEvent instance, applies to all events.

```typescript
const emitter = new FastEvent({
    executor: 'race', // Use race executor globally
});
```

### 2. Scope Configuration

Configured when creating a scope, overrides global configuration.

```typescript
const emitter = new FastEvent({
    executor: 'default',
});

const scope = emitter.scope('test', {
    executor: 'race', // Use race executor in this scope
});
```

### 3. Event Trigger Configuration

Specified when triggering an event, highest priority.

```typescript
const emitter = new FastEvent({
    executor: 'default',
});

// Use race executor only for this trigger
emitter.emit('test', data, {
    executor: 'race',
});
```

## Custom Executors

You can create custom executors to implement specific execution logic.

```typescript
const customExecutor = (listeners, message, args, execute) => {
    // listeners: Array of listeners, each element is a tuple of [listener, maxCount, executedCount]
    // message: Event message
    // args: Additional parameters
    // execute: Function to execute a single listener

    // Example: Only execute the first listener
    return [execute(listeners[0][0], message, args)];
};

const emitter = new FastEvent({
    executor: customExecutor,
});
```

### Execution Count Management

Each listener in FastEvent is stored as a tuple: `[listener, maxCount, executedCount]`

- `listener`: Listener function
- `maxCount`: Maximum execution count limit (0 means unlimited)
- `executedCount`: Number of times executed

**Important Notes:**

By default, listener execution counts are managed automatically, and you don't need to modify them manually.
After each listener execution, `FastEvent` automatically decrements the `executedCount` of all listeners.

However, in some executors, not all listeners need to be executed, such as in `race` and `balance` executors, which only select one listener function to execute from the array.
This can lead to listener execution counts not matching expectations.

Therefore, the executor needs to correct this issue to ensure the accuracy of `executedCount` values.

Taking the `random` executor as an example, it randomly selects one listener from the list to execute.

The pseudocode for executing listeners is as follows:

```ts
class FastEvent {
    _executeListeners(listeners, message, args, execute) {
        try {
            executor(listeners, message, args, execute);
        } finally {
            // Execution count of all listeners will be incremented
            // listener = [listener,maxCount,executedCount]
            listeners.forEach((listener) => {
                listener[2]++; //   [!code++]
            });
        }
    }
}
```

Since the `random` executor only selects one listener randomly from the list to execute, it needs to manually correct the listener execution counts.

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    // Decrement all listeners' execution counts to offset subsequent increment
    listeners.forEach((listener) => listener[2]--); //   [!code++]
    // Only increment the execution count of the selected listener
    listeners[index][2]++; //   [!code++ ]
    return [execute(listeners[index][0], message, args)];
};
```

### Why Use the execute Function

When creating custom listener executors, you need to use the `execute` function to execute listener functions.

Taking the `random` executor as an example, the `execute` function is used to execute the listener function.

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    listeners.forEach((listener) => listener[2]--);
    listeners[index][2]++;
    // ❌ Directly executing listener function: Cannot ensure accuracy of listener function's this context and error handling
    return [listeners[index][0](message, args)];
    // ✅ Use execute to execute listener function
    return [execute(listeners[index][0], message, args)];
};
```

## Practical Application Scenarios

### 1. Asynchronous Operation Racing

Use race executor to handle multiple data sources, adopting the fastest response.

```typescript
const emitter = new FastEvent({
    executor: 'race',
});

// Register multiple data source handlers
emitter.on('getData', async () => {
    const data = await primaryDB.query();
    return data;
});

emitter.on('getData', async () => {
    const data = await backupDB.query();
    return data;
});

// Get the fastest returning data
const result = await emitter.emitAsync('getData');
```

### 2. Load Balancing

Use balance executor to distribute tasks among multiple handlers.

```typescript
const emitter = new FastEvent({
    executor: 'balance',
});

// Register multiple work handlers
emitter.on('processTask', (task) => {
    return worker1.process(task);
});

emitter.on('processTask', (task) => {
    return worker2.process(task);
});

// Tasks will be evenly distributed among different handlers
tasks.forEach((task) => {
    emitter.emit('processTask', task);
});
```

### 3. Degradation Handling

Use custom executor to implement service degradation.

```typescript
const fallbackExecutor = (listeners, message, args, execute) => {
    // Try primary handler
    try {
        return [execute(listeners[0][0], message, args)];
    } catch (error) {
        // Use backup handler on failure
        return [execute(listeners[1][0], message, args)];
    }
};

const emitter = new FastEvent({
    executor: fallbackExecutor,
});

// Primary handler
emitter.on('process', (data) => {
    return mainProcessor.process(data);
});

// Backup handler
emitter.on('process', (data) => {
    return backupProcessor.process(data);
});
```