# FastEvent

FastEvent is a powerful TypeScript event management library that provides flexible event subscription and publishing mechanisms, supporting features such as event wildcards, scoping, and asynchronous events.

Compared to `EventEmitter2`, `FastEvent` has the following advantages:

-   `FastEvent` performs about `1+` times better than `EventEmitter2` when publishing and subscribing with wildcards.
-   `FastEvent` has a package size of `6.3kb`, while `EventEmitter2` is `43.4kb`.
-   `FastEvent` offers more comprehensive features.

# Installation

Install using npm:

```bash
npm install fastevent
```

Or using yarn:

```bash
yarn add fastevent
```

# Quick Start

## Basic Usage

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

## Event Message Format

FastEvent uses a standardized message format for all events:

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // Event type
    payload: P; // Event data
    meta: M; // Event metadata
};
```

Event listeners always receive this message object, providing consistent access to event data and metadata.

## Event Wildcards

FastEvent supports two types of wildcards:

-   `*`: Matches a single path level
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

## Event Scoping

Scopes allow you to handle events within specific namespaces. Note that scopes share the same listener table with the parent emitter:

```typescript
const events = new FastEvent();

// Create user-related scope
const userScope = events.scope('user');

// These are equivalent:
userScope.on('login', handler);
events.on('user/login', handler);

// These are also equivalent:
userScope.emit('login', data);
events.emit('user/login', data);

// Clear all listeners in the scope
userScope.offAll(); // Equivalent to events.offAll('user')
```

## Listener Options

When subscribing to events, you can specify additional options:

```typescript
interface FastEventListenOptions {
    // Number of times the listener should be called (0 for unlimited, 1 for once)
    count?: number;
    // Add the listener to the beginning of the listeners array
    prepend?: boolean;
}

// Example: Listen for first 3 occurrences
events.on('data', handler, { count: 3 });

// Example: Ensure handler is called before other listeners
events.on('important', handler, { prepend: true });
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

// Remove all listeners with wildcard pattern
events.off('user/*');

// Remove all listeners
events.offAll();

// Remove all listeners under a prefix
events.offAll('user');
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

## Asynchronous Events

Support for asynchronous event handling:

```typescript
const events = new FastEvent();

events.on('data/fetch', async () => {
    const response = await fetch('https://api.example.com/data');
    return await response.json();
});

// Async event publishing returns array of results/errors
const results = await events.emitAsync('data/fetch');
console.log('Results from all handlers:', results);
```

## Listener Return Values

Both `emit` and `emitAsync` methods return the results from all event listeners:

```typescript
const events = new FastEvent();

// Synchronous listeners with return values
events.on('calculate', () => 1);
events.on('calculate', () => 2);
events.on('calculate', () => 3);

// Get array of return values
const results = events.emit('calculate');
console.log('Results:', results); // [1, 2, 3]

// Asynchronous listeners
events.on('process', async () => 'result 1');
events.on('process', async () => 'result 2');

// Get array of resolved values/errors
const asyncResults = await events.emitAsync('process');
console.log('Async results:', asyncResults); // ['result 1', 'result 2']
```

For asynchronous events, `emitAsync` will wait for all listeners to complete and return an array containing either the resolved values or error objects if a listener fails.

## Event Waiting

Use `waitFor` to wait for specific events:

```typescript
const events = new FastEvent();

async function waitForLogin() {
    try {
        // Wait for login event with 5 seconds timeout
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

## Retain Event Data

Retain the last event data, new subscribers will receive it immediately:

```typescript
const events = new FastEvent();

// Publish event and retain
events.emit('config/update', { theme: 'dark' }, true);

// Later subscribers will immediately receive the retained data
events.on('config/update', (message) => {
    console.log('Config:', message.payload); // Immediately outputs: Config: { theme: 'dark' }
});
```

## Multi-level Events

Support for publishing and subscribing to multi-level events.

By default, '/' is used as the event path delimiter, but you can use custom delimiters:

```typescript
const events = new FastEvent({
    delimiter: '.',
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

Metadata is a mechanism for providing additional context information for events. You can set metadata globally or add specific metadata for individual events.

### Global Metadata

Set global metadata when creating a FastEvent instance:

```typescript
const events = new FastEvent({
    meta: {
        version: '1.0',
        environment: 'production',
    },
});

events.on('user/login', (message) => {
    console.log('Event data:', message.payload);
    console.log('Metadata:', message.meta); // Contains type, version, and environment
});
```

### Event-specific Metadata

Additional metadata can be passed when publishing events, which will be merged with global metadata:

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

// Add specific metadata when publishing event
events.emit(
    'order/create',
    { orderId: '123' }, // Event data
    false, // Don't retain
    { timestamp: Date.now() }, // Event-specific metadata
);

// Listener receives merged metadata
events.on('order/create', (message) => {
    console.log('Order:', message.payload); // { orderId: '123' }
    console.log('Metadata:', message.meta); // { type: 'order/create', app: 'MyApp', timestamp: ... }
});
```

## Error Handling

FastEvent provides error handling mechanisms:

```typescript
const events = new FastEvent({
    ignoreErrors: true, // Default is true, won't throw errors
    onListenerError: (type, error) => {
        console.error(`Error handling event ${type}:`, error);
    },
});

events.on('process', () => {
    throw new Error('Processing failed');
});

// Won't throw error, will trigger onListenerError instead
events.emit('process');
```

## TypeScript Support

FastEvent is written in TypeScript and provides full type support:

```typescript
// Define event types
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

// Create typed event emitter
const events = new FastEvent<MyEvents>();

// Type checking for event names and payload
events.on('user/login', (message) => {
    // message.payload is typed as { id: number; name: string }
    const { id, name } = message.payload;
});

// Error: wrong event name
events.emit('wrong/event', {});

// Error: wrong payload type
events.emit('user/login', { wrong: 'type' });
```

## Custom Options

The FastEvent constructor supports multiple options:

```typescript
const events = new FastEvent({
  // Event path delimiter, default is '/'
  delimiter: '.',
  // Context for event handlers
  context: null,
  // Metadata, passed to all event handlers
  meta: { ... },

  // Error handling
  ignoreErrors: true,
  onListenerError: (type, error) => {
    console.error(`Event error:`, type, error);
  },

  // Callbacks for listener addition/removal
  onAddListener: (path, listener) => {
    console.log('Listener added:', path);
  },
  onRemoveListener: (path, listener) => {
    console.log('Listener removed:', path);
  }
});
```

# Performance

![](./bench.png)
