# FastEvent

FastEvent is a powerful TypeScript event management library that provides flexible event subscription and publishing mechanisms, supporting features such as event wildcards, scoping, and asynchronous events.

Compared to `EventEmitter2`, `FastEvent` has the following advantages:

- `FastEvent` performs about `1+` times better than `EventEmitter2` when publishing and subscribing with wildcards.
- `FastEvent` has a package size of `6.3kb`, while `EventEmitter2` is `43.4kb`.
- `FastEvent` offers more comprehensive features.

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
events.on('user/login', (user) => {
  console.log('User login:', user);
});

// Publish event
events.emit('user/login', { id: 1, name: 'Alice' });
```

# Guide

## Event Wildcards

FastEvent supports two types of wildcards:
- `*`: Matches a single path level
- `**`: Matches multiple path levels

```typescript
const events = new FastEvent();

// Matches user/*/login
events.on('user/*/login', (data) => {
  console.log('Any user type login:', data);
});

// Matches all events under user
events.on('user/**', (data) => {
  console.log('All user-related events:', data);
});

// Trigger events
events.emit('user/admin/login', { id: 1 });  // Both handlers will be called
events.emit('user/admin/profile/update', { name: 'New' });  // Only ** handler will be called
```

## Event Scoping

Scopes allow you to handle events within specific namespaces:

```typescript
const events = new FastEvent();

// Create user-related scope
const userScope = events.scope('user');

// Subscribe to events within the scope
userScope.on('login', (data) => {
  console.log('User login:', data);
});

// Equivalent to events.emit('user/login', data)
userScope.emit('login', { id: 1 });
```

## One-time Events

Use `once` to subscribe to events that trigger only once:

```typescript
const events = new FastEvent();

events.once('startup', () => {
  console.log('Application started');
});

events.emit('startup');  // Output: Application started
events.emit('startup');  // No output, listener has been removed
```

## Asynchronous Events

Support for asynchronous event handling:

```typescript
const events = new FastEvent();

events.on('data/fetch', async () => {
  const response = await fetch('https://api.example.com/data');
  return await response.json();
});

// Async event publishing
const results = await events.emitAsync('data/fetch');
console.log('Results from all handlers:', results);
```

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
events.on('config/update', (config) => {
  console.log('Config:', config);  // Immediately outputs: Config: { theme: 'dark' }
});
```

## Multi-level Events

Support for publishing and subscribing to multi-level events.

By default, '/' is used as the event path delimiter, but you can use custom delimiters:

```typescript
const events = new FastEvent({
  delimiter: '.'
});
```

## Global Event Listening

Use `onAny` to listen to all events:

```typescript
const events = new FastEvent();

events.onAny((data, meta) => {
  console.log(`Event ${meta.type} triggered:`, data);
});

events.emit('user/login', { id: 1 });  // Output: Event user/login triggered: { id: 1 }
events.emit('system/error', 'Connection failed');  // Output: Event system/error triggered: Connection failed
```

## Metadata (Meta)

Metadata is a mechanism for providing additional context information for events. You can set metadata globally or add specific metadata for individual events.

### Global Metadata

Set global metadata when creating a FastEvent instance:

```typescript
const events = new FastEvent({
  meta: {
    version: '1.0',
    environment: 'production'
  }
});

events.on('user/login', (data, meta) => {
  console.log('Event data:', data);
  console.log('Metadata:', meta);  // Contains type, version, and environment
});
```

### Event-specific Metadata

Additional metadata can be passed when publishing events, which will be merged with global metadata:

```typescript
const events = new FastEvent({
  meta: { app: 'MyApp' }
});

// Add specific metadata when publishing event
events.emit('order/create', 
  { orderId: '123' },  // Event data
  false,  // Don't retain
  { timestamp: Date.now() }  // Event-specific metadata
);

// Listener receives merged metadata
events.on('order/create', (data, meta) => {
  console.log('Order:', data);  // { orderId: '123' }
  console.log('Metadata:', meta);  // { type: 'order/create', app: 'MyApp', timestamp: ... }
});
```

## Error Handling

FastEvent provides error handling mechanisms:

```typescript
const events = new FastEvent({
  ignoreErrors: true,  // Default is true, won't throw errors
  onListenerError: (type, error) => {
    console.error(`Error handling event ${type}:`, error);
  }
});

events.on('process', () => {
  throw new Error('Processing failed');
});

// Won't throw error, will trigger onListenerError instead
events.emit('process');
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