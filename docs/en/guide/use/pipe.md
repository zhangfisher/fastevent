# Listener Pipes

## Concept

Listener Pipes (`Pipe`) are a powerful mechanism provided by `FastEvent` to control and modify the execution behavior of event listeners. Through `pipe`, you can add features like timeout control, throttling, debouncing, retries, etc. to listeners, making event handling more flexible and controllable.

Key functions of `pipe` include:

- Controlling listener execution timing and frequency
- Handling execution exceptions and retries
- Optimizing performance and resource usage
- Implementing more complex event handling logic

## Basic Usage

When registering an event listener, you can use one or more pipes through the `options.pipes` parameter:

```typescript
emitter.on('eventName', listener, {
  pipes: [pipe1(), pipe2(), ...]
})
```

Multiple pipes will be processed in array order, forming a processing chain. Equivalent to `pipe2(pipe1(listener))...`

**Example 1**: Basic pipe usage, showing how to add timeout and retry functionality for API requests

```typescript
// Add timeout and retry functionality
emitter.on(
    'api/request',
    async (msg) => {
        // Handle API request
    },
    {
        pipes: [
            timeout(5000), // 5 second timeout
            retry(3), // Retry up to 3 times on failure
        ],
    },
);
```

## Guide

### timeout (Timeout Control)

The `timeout pipe` sets an execution time limit for listener functions, interrupting execution if it exceeds the specified time.

#### Features

- Sets maximum execution time for listeners
- Can return default value or throw error on timeout
- Suitable for asynchronous operations requiring time limits

#### Usage

```typescript
timeout(timeout: number, defaultValue?: any)
```

**Parameters:**

- `timeout`: Timeout duration (milliseconds)
- `defaultValue`: Optional default return value, throws `TimeoutError` if not provided

#### Examples

**Example 1**: Basic timeout control, throws error on timeout

```typescript
// Basic usage - throws error on timeout
emitter.on(
    'longTask',
    async () => {
        await someTimeConsumingTask();
    },
    {
        pipes: [timeout(100)], // 100ms timeout
    },
);
```

**Example 2**: Set default return value on timeout

```typescript
// Set default value
emitter.on(
    'apiRequest',
    async () => {
        const result = await fetchData();
        return result;
    },
    {
        pipes: [timeout(5000, 'default')], // Returns 'default' after 5s timeout
    },
);
```

**Example 3**: Handling multiple simultaneous events with timeout

```typescript
// Timeout handling for multiple events
emitter.on(
    'task',
    async (msg) => {
        await delay(msg.payload); // Processing time depends on payload
        return msg.payload * 2;
    },
    {
        pipes: [timeout(150, 'timeout')], // 150ms timeout
    },
);

// Trigger events
const results = await Promise.all([
    emitter.emit('task', 100), // Completes within 150ms
    emitter.emit('task', 200), // Times out
    emitter.emit('task', 50), // Completes within 150ms
]);
// results: [200, 'timeout', 100]
```

**Example 4**: Timeout in chained calls

```typescript
// Timeout in chained calls
emitter.on(
    'process',
    async (msg) => {
        const data = await transformData(msg.payload);
        return validate(data);
    },
    {
        pipes: [
            timeout(1000), // 1 second timeout for entire process
            retry(2), // Retry 2 times on failure
        ],
    },
);
```

### throttle (Throttling)

The `throttle pipe` limits listener execution frequency, ensuring sufficient time between executions.

#### Features

- Controls listener execution frequency
- Discards additional calls within interval
- Supports custom handling of discarded events

#### Usage

```typescript
throttle(interval: number, options?: {
  drop?: (message: FastEventMessage) => void
})
```

**Parameters:**

- `interval`: Throttle interval (milliseconds)
- `options.drop`: Optional callback for handling discarded events

#### Examples

**Example 1**: Basic throttling for scroll events

```typescript
// Basic throttling
emitter.on(
    'scroll',
    () => {
        updatePosition();
    },
    {
        pipes: [throttle(100)], // Executes at most once per 100ms
    },
);
```

**Example 2**: Handling discarded events

```typescript
// Handle discarded events
emitter.on(
    'input',
    (msg) => {
        processInput(msg.payload);
    },
    {
        pipes: [
            throttle(200, {
                drop: (msg) => console.log('Discarded input:', msg.payload),
            }),
        ],
    },
);
```

**Example 3**: Continuous triggering scenario

```typescript
// Continuous triggering scenario
let count = 0;
emitter.on(
    'click',
    () => {
        count++;
    },
    {
        pipes: [throttle(500)], // Executes once per 500ms
    },
);

// Trigger rapidly 5 times
for (let i = 0; i < 5; i++) {
    emitter.emit('click');
    await delay(100);
}
// Final count value: 1
```

**Example 4**: Throttling with timestamps

```typescript
// Throttling with timestamps
emitter.on(
    'log',
    (msg) => {
        console.log(`[${new Date().toISOString()}]`, msg.payload);
    },
    {
        pipes: [
            throttle(1000, {
                drop: (msg) => {
                    console.log(`Skipped log: ${msg.payload}`);
                },
            }),
        ],
    },
);
```

### memorize (Caching)

The `memorize pipe` caches listener execution results to avoid repeated calculations for same inputs.

#### Features

- Caches listener execution results
- Supports custom cache validation logic
- Each listener's cache is independent

#### Usage

```typescript
memorize(predicate?: (message: FastEventMessage) => boolean)
```

**Parameters:**

- `predicate`: Optional function to determine whether to use cache

#### Examples

**Example 1**: Basic caching for expensive calculations

```typescript
// Basic caching
emitter.on(
    'calculate',
    (msg) => {
        return expensiveCalculation(msg.payload);
    },
    {
        pipes: [memorize()],
    },
);
```

**Example 2**: Custom cache logic

```typescript
// Custom cache logic
emitter.on(
    'getData',
    (msg) => {
        return fetchData(msg.payload);
    },
    {
        pipes: [memorize((msg) => msg.payload === 'use-cache')],
    },
);
```

**Example 3**: Cache invalidation scenario

```typescript
// Cache invalidation scenario
let callCount = 0;
emitter.on(
    'getUser',
    (msg) => {
        callCount++;
        return { id: msg.payload, name: `User ${msg.payload}` };
    },
    {
        pipes: [memorize()],
    },
);

// Multiple calls with same parameter
await emitter.emit('getUser', 1); // callCount = 1
await emitter.emit('getUser', 1); // callCount remains 1, uses cache
await emitter.emit('getUser', 2); // callCount = 2, new parameter
```

**Example 4**: Caching with complex parameters

```typescript
// Caching with complex parameters
emitter.on(
    'search',
    (msg) => {
        return db.query({
            keyword: msg.payload.keyword,
            filters: msg.payload.filters,
        });
    },
    {
        pipes: [
            memorize((msg) => {
                // Only use cache when keyword and filters are identical
                return JSON.stringify(msg.payload) === JSON.stringify(lastQuery);
            }),
        ],
    },
);
```

**Example 5**: Caching with expiration time

```typescript
// Caching with expiration time
emitter.on(
    'getConfig',
    async (msg) => {
        return await fetchConfig(msg.payload);
    },
    {
        pipes: [
            memorize((msg, cached) => {
                // Use cache within 10 seconds
                return cached && Date.now() - cached.timestamp < 10000;
            }),
        ],
    },
);
```

**Example 6**: Combining cache with timeout

```typescript
// Combining cache with timeout
emitter.on(
    'apiRequest',
    async (msg) => {
        const result = await fetchApi(msg.payload);
        return result;
    },
    {
        pipes: [
            memorize(),
            timeout(5000), // 5 second timeout
        ],
    },
);
```

### retry (Retries)

The `retry pipe` automatically retries failed listener executions, supporting configurable retry counts and intervals.

#### Features

- Automatic retries on failure
- Configurable maximum retry count
- Customizable retry intervals
- Handles final failure cases

#### Usage

```typescript
retry(maxRetries: number, options?: {
  interval?: number,
  drop?: (message: FastEventMessage, error: Error) => void
})
```

**Parameters:**

- `maxRetries`: Maximum retry count
- `options.interval`: Retry interval (milliseconds)
- `options.drop`: Callback after reaching max retries

#### Examples

**Example 1**: Basic retry for connection failures

```typescript
// Basic retry
emitter.on(
    'connect',
    async () => {
        await connectToServer();
    },
    {
        pipes: [retry(3)], // Retry up to 3 times on failure
    },
);
```

**Example 2**: Custom retry configuration

```typescript
// Custom retry configuration
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, {
                interval: 1000, // Retry after 1 second
                drop: (msg, error) => console.error('Final failure:', error),
            }),
        ],
    },
);
```

**Example 3**: Exponential backoff retry strategy

```typescript
// Exponential backoff retry
emitter.on(
    'upload',
    async (msg) => {
        await uploadFile(msg.payload);
    },
    {
        pipes: [
            retry(4, {
                interval: (retryCount) => 1000 * Math.pow(2, retryCount), // Exponential backoff
                drop: (msg, error) => notifyAdmin(`Upload failed: ${msg.payload.name}`),
            }),
        ],
    },
);
```

**Example 4**: Conditional retry for specific errors

```typescript
// Conditional retry
emitter.on(
    'processPayment',
    async (msg) => {
        const result = await paymentGateway(msg.payload);
        if (result.status === 'pending') {
            throw new Error('Payment pending');
        }
        return result;
    },
    {
        pipes: [
            retry(3, {
                shouldRetry: (error) => error.message.includes('pending'), // Only retry specific errors
                interval: 2000,
            }),
        ],
    },
);
```

**Example 5**: Retry success scenario

```typescript
// Retry success scenario
let attempt = 0;
emitter.on(
    'unstableService',
    async () => {
        attempt++;
        if (attempt < 3) {
            throw new Error('Service unavailable');
        }
        return 'Success';
    },
    {
        pipes: [retry(3)],
    },
);

const result = await emitter.emit('unstableService');
// result: 'Success' (succeeds on 3rd attempt)
```

**Example 6**: Combining retry with timeout

```typescript
// Combining retry with timeout
emitter.on(
    'apiCall',
    async () => {
        const result = await fetchApi();
        return result;
    },
    {
        pipes: [
            retry(2, { interval: 1000 }),
            timeout(3000), // 3 second timeout per call
        ],
    },
);
```

### debounce (Debouncing)

The `debounce pipe` delays listener execution until no new calls occur within a specified time.

#### Features

- Delays listener execution
- Cancels pending executions
- Handles discarded events
- Suitable for frequently triggered events

#### Usage

```typescript
debounce(wait: number, options?: {
  drop?: (message: FastEventMessage) => void
})
```

**Parameters:**

- `wait`: Wait time (milliseconds)
- `options.drop`: Optional callback for discarded events

#### Examples

**Example 1**: Basic debouncing for resize events

```typescript
// Basic debouncing
emitter.on(
    'resize',
    () => {
        updateLayout();
    },
    {
        pipes: [debounce(200)], // Executes only after 200ms with no new calls
    },
);
```

**Example 2**: Handling discarded search requests

```typescript
// Handling discarded events
emitter.on(
    'search',
    (msg) => {
        performSearch(msg.payload);
    },
    {
        pipes: [
            debounce(300, {
                drop: (msg) => console.log('Discarded search:', msg.payload),
            }),
        ],
    },
);
```

**Example 3**: Immediate execution mode for button clicks

```typescript
// Immediate execution mode
emitter.on(
    'click',
    () => {
        console.log('Button clicked!');
    },
    {
        pipes: [
            debounce(1000, {
                immediate: true, // First trigger executes immediately
                drop: () => console.log('Rapid clicks ignored'),
            }),
        ],
    },
);
```

**Example 4**: Maximum wait time for analytics events

```typescript
// Maximum wait time
let lastCall = 0;
emitter.on(
    'analytics',
    (msg) => {
        lastCall = Date.now();
        sendAnalytics(msg.payload);
    },
    {
        pipes: [
            debounce(500, {
                maxWait: 2000, // Must execute within 2 seconds
                drop: (msg) => trackDroppedEvent(msg),
            }),
        ],
    },
);
```

**Example 5**: Continuous typing scenario

```typescript
// Continuous typing scenario
let executionCount = 0;
emitter.on(
    'typing',
    () => {
        executionCount++;
    },
    {
        pipes: [debounce(100)],
    },
);

// Rapid continuous typing
for (let i = 0; i < 10; i++) {
    emitter.emit('typing');
    await delay(50);
}
await delay(150);
// Final executionCount: 1
```

**Example 6**: Debouncing with cancellation for fetch requests

```typescript
// Debouncing with cancellation
const controller = new AbortController();
emitter.on(
    'fetch',
    async (msg) => {
        const data = await fetchWithSignal(msg.payload, controller.signal);
        return data;
    },
    {
        pipes: [
            debounce(300, {
                cancel: controller.abort.bind(controller),
            }),
        ],
    },
);
```

### queue (Queue)

The `queue pipe` puts listener executions into a queue to control concurrent execution and processing order.

#### Features

- Controls concurrent listener execution
- Manages event processing queue
- Supports multiple overflow strategies
- Customizable queue sorting logic

#### Usage

```typescript
queue(options: {
  size?: number,
  overflow?: 'slide' | 'drop' | 'throw' | 'expand',
  expandOverflow?: 'slide' | 'drop' | 'throw',
  maxExpandSize?: number,
  onNew?: (newMsg: FastEventMessage, queuedMsgs: FastEventMessage[]) => void
})
```

**Parameters:**

- `size`: Queue size
- `overflow`: Overflow handling strategy
- `expandOverflow`: Expansion strategy (when overflow is `expand`)
- `maxExpandSize`: Maximum expansion size
- `onNew`: Handler for new messages entering queue

#### Examples

**Example 1**: Basic queue limiting task queue size

```typescript
// Basic queue
emitter.on(
    'task',
    async (msg) => {
        await processTask(msg.payload);
    },
    {
        pipes: [queue({ size: 5 })], // Maximum 5 concurrent tasks
    },
);
```

**Example 2**: Queue overflow handling

```typescript
// Queue overflow handling
emitter.on(
    'log',
    (msg) => {
        writeToDisk(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 10,
                overflow: 'slide', // Remove oldest task
            }),
        ],
    },
);
```

**Example 3**: Priority queue

```typescript
// Priority queue
emitter.on(
    'job',
    async (msg) => {
        await runJob(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 3,
                onNew: (newMsg, queuedMsgs) => {
                    // Sort by priority
                    const insertIndex = queuedMsgs.findIndex((msg) => (msg.meta.priority ?? 0) < (newMsg.meta.priority ?? 0));
                    queuedMsgs.splice(insertIndex, 0, newMsg);
                },
            }),
        ],
    },
);
```

**Example 4**: Expandable queue

```typescript
// Expandable queue
emitter.on(
    'request',
    async (msg) => {
        await handleRequest(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 2,
                overflow: 'expand',
                maxExpandSize: 4,
                expandOverflow: 'drop',
            }),
        ],
    },
);
```