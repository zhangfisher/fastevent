# Quick Start

This section will help you quickly get started with FastEvent, understanding its core features and basic usage.

## Step 1: Installation

Install FastEvent using `npm/yarn/pnpm/bun`:

::: code-group

```bash [npm]
npm install fastevent
```

```bash [yarn]
yarn add fastevent
```

```bash [pnpm]
pnpm add fastevent
```

```bash [bun]
bun add fastevent
```

:::

## Step 2: Create Event Emitter

```typescript
import { FastEvent } from 'fastevent';

// Create basic event emitter

// Or create event emitter with type definitions
interface Events {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'message/new': { content: string };
}

const typedEmitter = new FastEvent<Events>();
```

## Step 3: Register Event Listeners

```typescript
// Listen to a single event
emitter.on('user/login', (message) => {
    console.log(`User login: ${message.payload.userId}`);
});

// Use wildcards to listen to multiple events
emitter.on('user/*', (message) => {
    console.log(`User event: ${message.type}`);
});

// Listen to all events
emitter.onAny((message) => {
    console.log(`Event triggered: ${message.type}`);
});

// One-time event listener
emitter.once('message/new', (message) => {
    console.log(`New message: ${message.payload.content}`);
});
```

## Step 4: Trigger Events

```typescript
// Synchronously trigger event
emitter.emit('user/login', { userId: '123' });

// Synchronously trigger event with retain=true
// Retain the last event data for future subscribers
emitter.emit('user/login', { userId: '123' }, true);

// Asynchronously trigger event
await emitter.emitAsync('message/new', { content: 'Hello' });

// Event with metadata
emitter.emit('user/login', { userId: '123' }, false, {
    timestamp: Date.now(),
});
```

## Step 5: Using Scopes

Scopes help you better organize and manage events:

```typescript
// Create scope for user-related events
const userScope = emitter.scope('user');

// Listen to events in scope (actually listens to 'user/login')
userScope.on('login', (message) => {
    console.log(`User login: ${message.payload.userId}`);
});

// Trigger events in scope
userScope.emit('login', { userId: '123' });

// Create nested scopes
const profileScope = userScope.scope('profile');
profileScope.emit('update', { name: 'John' }); // Actually triggers 'user/profile/update'
```

## Step 6: Using Event Retention

Event retention allows new subscribers to immediately receive the last event data:

```typescript
// Trigger event and retain it
emitter.emit('system/status', { online: true }, true);

// Later registered listeners will immediately receive the retained event data
emitter.on('system/status', (message) => {
    console.log(`System status: ${message.payload.online}`);
});
```

## Step 7: Waiting for Events

Use the waitFor method to wait for specific events:

```typescript
try {
    // Wait for login event, maximum 5 seconds
    const message = await emitter.waitFor('user/login', 5000);
    console.log('User logged in:', message.payload);
} catch (error) {
    console.log('Wait timeout');
}
```

## Step 8: Cleaning Up Events

```typescript
// Remove all listeners for a specific event
emitter.off('user/login');

// Remove all listeners in a specific scope
userScope.offAll();

// Remove all event listeners
emitter.offAll();
```

## Type Safety

FastEvent provides complete TypeScript support for comprehensive type hints and checks:

```typescript
interface Events {
    'user/login': { userId: string };
    'user/logout': void;
}

const emitter = new FastEvent<Events>();

// Correct types
emitter.emit('user/login', { userId: '123' }); // ✅

// Type errors
emitter.emit('user/login', { userId: 123 }); // ❌ Type error
emitter.emit('unknown/event', {}); // ❌ Undefined event
```

Through these steps, you've learned the basic usage of `FastEvent`. For more advanced features and detailed explanations, please refer to the following sections.