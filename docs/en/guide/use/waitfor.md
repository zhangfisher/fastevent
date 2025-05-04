# Event Waiting Mechanism

FastEvent provides the `waitFor` method, allowing you to wait for specific events to trigger using Promises. This is particularly useful for scenarios requiring asynchronous event completion.

## Basic Usage

### Syntax

```typescript
waitFor<T>(type: string, timeout?: number): Promise<FastEventMessage>
```

### Parameters

- `type`: The event type to wait for. Supports:
  - Exact match: `user/login`
  - Single-level wildcard: `user/*` (matches any single level under user)
  - Multi-level wildcard: `user/**` (matches all levels under user)

  **Important restriction**: Wildcards (* and **) can only be used at the end of event types:
  - ✅ Correct: `user/*`, `user/profile/**`
  - ❌ Incorrect: `user/**/update`

- `timeout`: (Optional) Timeout in milliseconds (default 0 means no timeout)

### Return Value

Returns a Promise resolving to the event message object containing:
- `type`: Event type
- `payload`: Event data
- `meta`: Event metadata

## Guide

### Basic Waiting

```typescript
const emitter = new FastEvent();

// Wait for login event
async function waitForLogin() {
    try {
        const event = await emitter.waitFor('user/login');
        console.log('User logged in:', event.payload);
    } catch (error) {
        console.error('Login wait failed:', error);
    }
}

// Trigger login elsewhere
emitter.emit('user/login', { userId: 123 });
```

### Using Wildcards

```typescript
const emitter = new FastEvent();

// Wait for any user event
async function waitForUserEvents() {
    // Wait for any single-level user event
    const singleLevel = await emitter.waitFor('user/*');
    console.log('User event received:', singleLevel.type); // e.g. user/login, user/logout

    // Wait for any multi-level user profile event
    const multiLevel = await emitter.waitFor('user/profile/**');
    console.log('Profile event received:', multiLevel.type); // e.g. user/profile/update, user/profile/settings/change
}

// Trigger events
emitter.emit('user/login', { userId: 123 });
emitter.emit('user/profile/settings/theme', { theme: 'dark' });
```

### Setting Timeout

```typescript
const emitter = new FastEvent();

async function waitForServerResponse() {
    try {
        // Wait max 5 seconds
        const event = await emitter.waitFor('server/response', 5000);
        console.log('Server response:', event.payload);
    } catch (error) {
        console.error('Wait timeout');
    }
}
```

### Type-Safe Waiting

```typescript
interface MyEvents {
    'user/login': { userId: string; timestamp: number };
    'user/logout': { userId: string };
}

const emitter = new FastEvent<MyEvents>();

async function handleUserLogin() {
    const event = await emitter.waitFor('user/login');
    // TypeScript correctly infers payload type
    console.log(event.payload.userId, event.payload.timestamp);
}
```

### Using in Scopes

When using `waitFor` in scopes, event types automatically get scope prefixes, but prefixes are removed when receiving events.

```typescript
const emitter = new FastEvent();
const userScope = emitter.scope('user');

async function handleProfileUpdate() {
    // Wait for 'user/profile/update' event
    const event = await userScope.waitFor('profile/update');
    // event.type will be 'profile/update' (prefix automatically removed)
    console.log('Profile updated:', event.payload);
}

// Can trigger via scope or main emitter
userScope.emit('profile/update', { name: 'John' });
// Or
emitter.emit('user/profile/update', { name: 'John' });
```

## Practical Applications

### Waiting for Initialization

```typescript
const emitter = new FastEvent();

async function initializeApp() {
    // Parallel wait for multiple initialization events
    await Promise.all([
        emitter.waitFor('database/ready'),
        emitter.waitFor('cache/ready'), 
        emitter.waitFor('config/loaded')
    ]);

    console.log('App initialization complete');
}
```

### Async Process Control

```typescript
const emitter = new FastEvent();

async function processUserData(userId: string) {
    // Trigger data processing
    emitter.emit('data/process/start', { userId });

    try {
        // Wait for completion
        const result = await emitter.waitFor('data/process/complete', 10000);
        return result.payload;
    } catch (error) {
        // Handle timeout/error
        emitter.emit('data/process/error', { userId, error });
        throw error;
    }
}
```

### State Synchronization

```typescript
const emitter = new FastEvent();

async function waitForStateSync() {
    let retries = 3;

    while (retries > 0) {
        try {
            // Send sync request
            emitter.emit('state/sync/request');
            // Wait for sync completion
            const event = await emitter.waitFor('state/sync/complete', 2000);
            return event.payload;
        } catch (error) {
            retries--;
            if (retries === 0) throw new Error('State sync failed');
        }
    }
}
```

## Important Notes

1. Wildcard Usage
   - Wildcards (* and **) only at end of event types
   - Single-level (*) matches one level only
   - Multi-level (**) matches any levels
   - No wildcards in middle of event types

2. Timeout Handling
   - Set reasonable timeouts to avoid infinite waits
   - Timeouts automatically clean up listeners
   - Timeouts throw errors - ensure proper error handling

3. Memory Management
   - waitFor automatically cleans up listeners after trigger/timeout
   - No manual off() calls needed

4. Scope Usage
   - Be aware of automatic prefix handling in scopes
   - Can trigger via scope or main emitter
   - Event message types automatically handle prefixes