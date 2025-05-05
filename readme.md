# FastEvent

[WebSite](https://zhangfisher.github.io/fastevent/)

FastEvent is a powerful `TypeScript` event management library that provides flexible event subscription and publishing mechanisms, supporting features like event wildcards, scoping, and asynchronous events.

# Installation

```bash
npm install fastevent
yarn add fastevent
pnpm add fastevent
bun add fastevent
```

# Quick Start

```typescript
import { FastEvent } from 'fastevent';

// Create event instance
const events = new FastEvent();

// Subscribe to event
events.on('user/login', (message) => {
    console.log('User login:', message.payload);
    console.log('Event type:', message.type);
    console.log('Metadata:', message.meta);
});

// Publish event - Method 1: Parameters
events.emit('user/login', { id: 1, name: 'Alice' });

// Publish event - Method 2: Message object
events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
    meta: { timestamp: Date.now() },
});
```

# Guide

## Event Emission and Listening

FastEvent provides complete event emission and subscription API:

```typescript
const events = new FastEvent();

// Basic event emission
events.emit('user/login', { id: 1, name: 'Zhang' });

// Event emission with metadata and retention
events.emit('config/theme', { dark: true }, true, { timestamp: Date.now() });

// Async event emission
const results = await events.emitAsync('data/process', { items: [...] });

// Event subscription
events.on('user/login', (message) => {
    console.log('User login:', message.payload);
});

// One-time listener
events.once('startup', () => console.log('Application started'));

// Listening with options
events.on('data/update', handler, {
    count: 3,       // Maximum trigger count
    prepend: true,  // Add to beginning of queue
    filter: (msg) => msg.payload.important // Only process important updates
});

// Global listener
events.onAny((message) => {
    console.log('Event occurred:', message.type);
});
```

## Event Retention

Retain the last event value for late subscribers:

```typescript
const events = new FastEvent();

// Emit and retain event
events.emit('config/theme', { dark: true }, true);

// Late subscribers immediately receive retained value
events.on('config/theme', (message) => {
    console.log('Theme:', message.payload); // Immediately outputs: { dark: true }
});
```

## Event Wildcards

FastEvent supports two types of wildcards:

-   `*`: Matches single path level
-   `**`: Matches multiple path levels

```typescript
const events = new FastEvent();

// Matches user/*/login
events.on('user/*/login', (message) => {
    console.log('Any user type login:', message.payload);
});

// Matches all events under user
events.on('user/**', (message) => {
    console.log('All user-related events:', message.payload);
});

// Trigger events
events.emit('user/admin/login', { id: 1 }); // Both handlers will be called
events.emit('user/admin/profile/update', { name: 'New' }); // Only ** handler will be called
```

## Removing Listeners

FastEvent provides multiple ways to remove listeners:

```typescript
// Remove specific listener
events.off(listener);

// Remove all listeners for an event
events.off('user/login');

// Remove specific listener for an event
events.off('user/login', listener);

// Remove listeners with wildcard pattern
events.off('user/*');

// Remove all listeners
events.offAll();

// Remove all listeners under a prefix
events.offAll('user');
```

## Event Scoping

Scopes allow you to handle events within specific namespaces.

Note: Scopes share the same listener table with the parent emitter:

```typescript
const events = new FastEvent();

// Create user-related scope
const userScope = events.scope('user');

// These two are equivalent:
userScope.on('login', handler);
events.on('user/login', handler);

// These two are also equivalent:
userScope.emit('login', data);
events.emit('user/login', data);

// Clear all listeners in scope
userScope.offAll(); // Equivalent to events.offAll('user')
```

## One-time Events

Use `once` to subscribe to events that trigger only once:

```typescript
const events = new FastEvent();

events.once('startup', () => {
    console.log('Application started');
});

// Equivalent to:
events.on('startup', handler, { count: 1 });
```

## Event Waiting

Use `waitFor` to wait for specific events:

```typescript
const events = new FastEvent();

async function waitForLogin() {
    try {
        // Wait for login event with 5 second timeout
        const userData = await events.waitFor('user/login', 5000);
        console.log('User logged in:', userData);
    } catch (error) {
        console.log('Login wait timeout');
    }
}

waitForLogin();
// Later trigger login event
events.emit('user/login', { id: 1, name: 'Alice' });
```

## Multi-level Events and Wildcards

FastEvent supports hierarchical event structures and powerful wildcard matching:

1. Single-level wildcard (`*`): Matches single level in event path
2. Multi-level wildcard (`**`): Matches zero or more levels, must be at end of path pattern

```typescript
// Match all user-related events
events.on('user/*', (message) => {
    console.log('User event:', message.type);
    // Matches: user/login, user/update, etc.
});

// Match all API events
events.on('api/**', (message) => {
    console.log('API event:', message.type, message.payload);
    // Matches: api/get, api/users/create, api/posts/123/comments/add, etc.
});
```

## Global Event Listening

Use `onAny` to listen to all events:

```typescript
const events = new FastEvent();

events.onAny((message) => {
    console.log(`Event ${message.type} triggered:`, message.payload);
});

// Can also use prepend option
events.onAny(handler, { prepend: true });
```

## Metadata (Meta)

Metadata provides additional context information for events.

You can set metadata at different levels: global, scope-level, or event-specific.

```typescript
const events = new FastEvent({
    meta: {
        version: '1.0',
        environment: 'production',
    },
});

events.on('user/login', (message) => {
    console.log('Event data:', message.payload);
    console.log('Metadata:', message.meta); // Contains type, version and environment
});

// Using scope-level metadata
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});
// Add specific metadata when publishing event
userScope.emit(
    'login',
    { userId: '123' }, // Event data
    false, // Don't retain
    { timestamp: Date.now() }, // Event-specific metadata
);

// Listener receives merged metadata
userScope.on('login', (message) => {
    console.log('Metadata:', message.meta);
    // { type: 'user/login', app: 'MyApp', domain: 'user', timestamp: ... }
});
```

## Event Type Definitions

```typescript
// Define events with different payload types
interface ComplexEvents {
    'data/number': number;
    'data/string': string;
    'data/object': { value: any };
}

const events = new FastEvent<ComplexEvents>();

// TypeScript ensures type safety for each event
events.on('data/number', (message) => {
    const sum = message.payload + 1; // payload is typed as number
});

// All event emissions are type checked
events.emit('data/number', 42);
events.emit('data/string', 'hello');
events.emit('data/object', { value: true });
```

## Event Hooks

FastEvent provides several hooks for monitoring and debugging the event system:

```typescript
const events = new FastEvent({
    // Called when adding new listener
    onAddListener: (path: string[], listener: Function) => {
        console.log('New listener added:', path.join('/'));
    },

    // Called when removing listener
    onRemoveListener: (path: string[], listener: Function) => {
        console.log('Listener removed:', path.join('/'));
    },

    // Called when clearing listeners
    onClearListeners: () => {
        console.log('All listeners cleared');
    },

    // Called when listener throws error
    onListenerError: (type: string, error: Error) => {
        console.error(`Listener error for event ${type}:`, error);
    },
    // Called before executing listener
    onBeforeExecuteListener: (message, returns, listeners) => {
        console.log('Before executing listener');
        return true / false;
    },

    // Called after executing listener
    onAfterExecuteListener: (message, returns, listeners) => {
        console.log('After executing listener');
    },
});
```

## Executors

Executors control how listeners are executed after triggering an event, default is `default` parallel executor.

```typescript
const events = new FastEvent({
    executor: 'race',
});

events.on('task/start', async () => {
    /* Time-consuming operation1 */
});
events.on('task/start', async () => {
    /* Time-consuming operation2 */
});

// Two listeners execute in parallel, return fastest result
await events.emitAsync('task/start');
```

Built-in support:

| Executor                | Description                                  |
| ----------------------- | -------------------------------------------- |
| `default`               | Default executor, executes sequentially      |
| `allSettled`            | Parallel executor using `Promise.allSettled` |
| `race`                  | Parallel executor using `Promise.race`       |
| `balance`               | Balanced executor                            |
| `first`                 | Only first registered listener executes      |
| `last`                  | Only last registered listener executes       |
| `random`                | Randomly executes listeners                  |
| `IFastListenerExecutor` | Custom executor                              |

## Listener Pipes

Listener pipes wrap listener functions when subscribing to events to implement various advanced features.

```typescript
import { queue } from 'fastevent';
const events = new FastEvent();

// Queued listener with default queue size of 10
events.on(
    'data/update',
    (data) => {
        console.log('Processing data:', data);
    },
    {
        pipes: [queue({ size: 10 })],
    },
);
```

Built-in support:

| Pipe       | Description                                                                    |
| ---------- | ------------------------------------------------------------------------------ |
| `queue`    | Queued listener for controlling execution order, supports priority and timeout |
| `throttle` | Throttle listener for controlling execution frequency                          |
| `debounce` | Debounce listener for controlling execution frequency                          |
| `timeout`  | Timeout listener for controlling execution timeout                             |
| `retry`    | Retry listener for retrying after execution failure                            |
| `memorize` | Cache listener for caching execution results                                   |
