# FastEvent

FastEvent is a powerful TypeScript event management library that provides flexible event subscription and publishing mechanisms, supporting features such as event wildcards, scoping, and asynchronous events.

[Document](https://zhangfisher.github.io/fastevent/)

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

// Using TypeScript with type safety
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

const typedEvents = new FastEvent<MyEvents>();

// TypeScript will enforce correct event types and payloads
typedEvents.on('user/login', (message) => {
    const { id, name } = message.payload; // Properly typed
});
```

# Guide

## Core Features

### Event Emission and Listening

FastEvent provides a comprehensive API for event emission and subscription:

```typescript
const events = new FastEvent();

// Basic event emission
events.emit('user/login', { id: 1, name: 'Alice' });

// With metadata and retention
events.emit('config/theme', { dark: true }, true, { timestamp: Date.now() });

// Async event emission
const results = await events.emitAsync('data/process', { items: [...] });

// Event subscription
events.on('user/login', (message) => {
    console.log('User logged in:', message.payload);
});

// One-time listener
events.once('startup', () => console.log('App started'));

// Listen with options
events.on('data/update', handler, {
    count: 3,       // Max trigger count
    prepend: true,  // Add to start of queue
    filter: (msg) => msg.payload.important
});

// Global listener
events.onAny((message) => {
    console.log('Event occurred:', message.type);
});
```

### Event Listening

Multiple ways to subscribe to events, with support for wildcards and options:

```typescript
const events = new FastEvent();

// Basic event listening
events.on('user/login', (message) => {
    console.log('User logged in:', message.payload);
});

// One-time event listening
events.once('startup', (message) => {
    console.log('Application started');
});

// Listen with options
events.on('data/update', handler, {
    count: 3, // Listen only 3 times
    prepend: true, // Add listener to the beginning
    filter: (msg) => msg.payload.important, // Only handle important updates
    off: (msg) => msg.payload.final, // Auto unsubscribe on final update
});

// Listen to all events
events.onAny((message) => {
    console.log('Event occurred:', message.type);
});
```

### Event Scoping

Create namespaced event handlers with shared context and metadata:

```typescript
const events = new FastEvent();

// Basic scope creation
const userScope = events.scope('user', {
    meta: { domain: 'user' },
    context: { userId: 1 },
});

// These are equivalent:
userScope.on('login', handler);
events.on('user/login', handler);

// Nested scopes with context inheritance
const profileScope = userScope.scope('profile', {
    meta: { section: 'profile' }, // Merges with parent meta
    context: { role: 'admin' }, // Extends parent context
});

// The final event will have combined metadata
profileScope.emit('update', { name: 'John' }); // Emits: user/profile/update
// Meta: { domain: 'user', section: 'profile' }

// Scope with custom executor
const adminScope = events.scope('admin', {
    context: { permissions: ['all'] },
    executor: async (listeners, message) => {
        // Custom parallel execution
        return await Promise.all(
            listeners.map((listener) => {
                try {
                    return listener.call(adminScope.context, message);
                } catch (error) {
                    console.error(`Admin scope error:`, error);
                    return error;
                }
            }),
        );
    },
});

// Access scope context in listeners
adminScope.on('action', function () {
    console.log(this.permissions); // Access scope context: ['all']
});

// Scope-specific error handling
const apiScope = events.scope('api', {
    meta: { source: 'api' },
    onListenerError: (type, error) => {
        console.error(`API Error in ${type}:`, error);
    },
});

// Clean up scope events
profileScope.offAll(); // Removes all listeners in user/profile/*
profileScope.clear(); // Also clears retained events
```

Advanced scope features:

-   Automatic prefix management for event types
-   Metadata inheritance and merging from parent scopes
-   Context inheritance with override capability
-   Custom executor functions per scope
-   Scope-specific error handling
-   Isolated cleanup with `offAll()` and `clear()`

### Event Patterns

Support for flexible event pattern matching:

```typescript
const events = new FastEvent();

// Exact match
events.on('user/login', handler);

// Single-level wildcard
events.on('user/*/action', (message) => {
    // Matches: user/admin/action, user/guest/action, etc.
});

// Multi-level wildcard
events.on('api/**', (message) => {
    // Matches: api/users, api/users/create, api/posts/123/comments, etc.
});
```

### Event Retention

Keep last event value for late subscribers:

```typescript
const events = new FastEvent();

// Emit and retain event
events.emit('config/theme', { dark: true }, true);

// Later subscribers immediately receive retained value
events.on('config/theme', (message) => {
    console.log('Theme:', message.payload); // Immediately outputs: { dark: true }
});
```

### Async Operations

Support for asynchronous event handling and waiting:

```typescript
const events = new FastEvent();

// Async event handlers
events.on('data/process', async (message) => {
    const result = await processData(message.payload);
    return result;
});

// Wait for specific event
try {
    const event = await events.waitFor('server/ready', 5000);
    console.log('Server is ready:', event.payload);
} catch (error) {
    console.log('Timeout waiting for server');
}

// Async event emission with error handling
const results = await events.emitAsync('batch/process', items);
results.forEach((result) => {
    if (result instanceof Error) {
        console.error('Processing failed:', result);
    } else {
        console.log('Success:', result);
    }
});
```

### Error Handling

Flexible error handling strategies:

```typescript
const events = new FastEvent({
    ignoreErrors: true, // Don't throw errors
    onListenerError: (type, error) => {
        console.error(`Error in ${type}:`, error);
    },
});

// Error in listener won't break execution
events.on('process', () => {
    throw new Error('Processing failed');
});
events.emit('process'); // Error is caught and handled
```

### Type Safety

Full TypeScript support for type-safe events:

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

const events = new FastEvent<MyEvents>();

// Type checking for event names and payloads
events.on('user/login', (message) => {
    const { id, name } = message.payload; // Properly typed
});

// Error: wrong payload type
events.emit('user/login', { id: '1' }); // TypeScript error
```

## Event Triggering

### Retained Events

Set `retain=true` to store the event for new subscribers:

```typescript
// Emit and retain the event
events.emit('config/update', { theme: 'dark' }, true);

// Later subscribers will immediately receive the retained event
events.on('config/update', (message) => {
    console.log('Config:', message.payload); // { theme: 'dark' }
});
```

### Event Metadata

Metadata can be provided at different levels and will be merged:

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' }, // Global metadata
});

// Event-specific metadata
events.emit('order/create', { id: '123' }, false, {
    timestamp: Date.now(),
});

// Listener receives merged metadata:
// { type: 'order/create', app: 'MyApp', timestamp: ... }
```

### Return Values

`emit()` returns an array of listener results:

```typescript
events.on('calculate', () => 1);
events.on('calculate', () => 2);

const results = events.emit('calculate');
console.log(results); // [1, 2]
```

### Type-safe Event Triggering

With TypeScript, event payloads are type-checked:

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
}

const events = new FastEvent<MyEvents>();

// Valid - payload matches type
events.emit('user/login', { id: 1, name: 'Alice' });

// Error - payload type mismatch
events.emit('user/login', { id: '1' }); // TypeScript error
```

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

// Nested scopes
const profileScope = userScope.scope('profile');
profileScope.on('update', (message) => {
    // Will receive events emitted as 'user/profile/update'
    console.log('Profile update:', message.payload);
});

// Scope with metadata
const adminScope = events.scope('admin', {
    meta: { role: 'admin' },
    context: { adminId: 1 },
});

adminScope.on('action', function (message) {
    console.log('Admin meta:', message.meta); // Contains { role: 'admin' }
    console.log('Context:', this.adminId); // Access to scope context
});

// Type-safe scopes
interface UserEvents {
    login: { id: number };
    logout: { id: number };
}

const typedUserScope = events.scope<'user', UserEvents>('user');
typedUserScope.on('login', (message) => {
    const { id } = message.payload; // Properly typed as { id: number }
});
```

Scopes provide several benefits:

1. Namespace organization - Group related events under a common prefix
2. Code organization - Separate event handling logic by domain
3. Metadata inheritance - Share common metadata across related events
4. Context binding - Provide specific execution context for event handlers
5. Type safety - Enforce type checking for scoped events

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

## Multi-level Events and Wildcards

FastEvent supports hierarchical event structures with powerful wildcard matching capabilities.

### Event Path Structure

Events can be organized in a hierarchical structure using path delimiters (default is '/'):

```typescript
const events = new FastEvent();

// Basic multi-level events
events.on('user/profile/update', handler);
events.on('user/settings/theme/change', handler);

// Custom delimiter
const customEvents = new FastEvent({
    delimiter: '.',
});
customEvents.on('user.profile.update', handler);
```

### Wildcard Patterns

FastEvent supports two types of wildcards:

1. Single-level wildcard (`*`):
    - Matches exactly one level in the event path
    - Can be used at any level in the path

```typescript
// Match any user type
events.on('user/*/login', (message) => {
    console.log('User type:', message.type.split('/')[1]);
    // Matches: user/admin/login, user/guest/login, etc.
});

// Match any action
events.on('api/users/*/action/*', (message) => {
    const [, , userId, , action] = message.type.split('/');
    console.log(`User ${userId} performed ${action}`);
    // Matches: api/users/123/action/update, api/users/456/action/delete, etc.
});
```

2. Multi-level wildcard (`**`):
    - Matches zero or more levels in the event path
    - Must be used at the end of the path pattern

```typescript
// Match all user-related events
events.on('user/**', (message) => {
    console.log('User event:', message.type);
    // Matches: user/login, user/profile/update, user/settings/theme/change, etc.
});

// Match all API events
events.on('api/**', (message) => {
    console.log('API event:', message.type, message.payload);
    // Matches: api/get, api/users/create, api/posts/123/comments/add, etc.
});
```

### Advanced Wildcard Usage

```typescript
const events = new FastEvent();

// Using single-level wildcards
events.on('service/*/user/update', (message) => {
    // Matches patterns like:
    // service/auth/user/update
    // service/admin/user/update
    const parts = message.type.split('/');
    const serviceType = parts[1];
    console.log(`${serviceType} service user update:`, message.payload);
});

// Using multi-level wildcard at the end
events.on('service/auth/**', (message) => {
    // Matches patterns like:
    // service/auth/user/update
    // service/auth/user/profile/update
    // service/auth/settings/theme/change
    console.log('Auth service event:', message.type, message.payload);
});

// Type-safe events with TypeScript
interface ApiEvents {
    'api/users/profile': { userId: string; data: any };
    'api/posts/comments': { postId: string; commentId: string; text: string };
}

const typedEvents = new FastEvent<ApiEvents>();

// Exact match with type safety
typedEvents.on('api/users/profile', (message) => {
    const { userId, data } = message.payload; // Properly typed
});

// Wildcard listeners still work but lose some type safety
typedEvents.on('api/*', (message) => {
    // message.payload type is any here
    console.log('API event:', message.type);
});

// Wildcard event monitoring
events.on('**', (message) => {
    console.log('Event intercepted:', {
        type: message.type,
        timestamp: new Date(),
        payload: message.payload,
    });
});

// Example usage
events.emit('service/auth/user/profile/update', { name: 'John' });
events.emit('api/users/123/profile', { userId: '123', data: { age: 30 } });
```

### Important Notes

1. Wildcard Limitations:

    - `**` wildcard must be at the end of the path
    - `*` can be used multiple times in a path
    - Wildcards cannot be combined in a single segment (e.g., 'a/\*\*/b' is invalid)

2. Performance Considerations:

    - Specific patterns (without wildcards) are matched faster
    - `*` wildcards are more efficient than `**`
    - Excessive use of `**` wildcards may impact performance

3. Best Practices:
    - Use specific patterns when possible
    - Limit the use of `**` wildcards
    - Consider the event hierarchy carefully
    - Use TypeScript interfaces for type safety

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

Metadata is a mechanism for providing additional context information for events. You can set metadata at different levels: globally, scope-level, or event-specific.

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

### Scope Metadata

When creating a scope, you can provide metadata that will be merged with global metadata:

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

userScope.on('login', (message) => {
    console.log('Metadata:', message.meta);
    // { type: 'user/login', app: 'MyApp', domain: 'user' }
});

// Nested scopes merge metadata recursively
const profileScope = userScope.scope('profile', {
    meta: { section: 'profile' },
});

profileScope.on('update', (message) => {
    console.log('Metadata:', message.meta);
    // { type: 'user/profile/update', app: 'MyApp', domain: 'user', section: 'profile' }
});
```

### Event-specific Metadata

Additional metadata can be passed when publishing events, which will be merged with higher-level metadata:

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

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

### Metadata Merge Rules

1. Priority (highest to lowest):

    - Event-specific metadata
    - Scope metadata (innermost to outermost)
    - Global metadata
    - System metadata (type is always added)

2. Merge behavior:

    - Shallow merge (top-level properties only)
    - Later values override earlier ones
    - No deep merging of nested objects

3. Special cases:
    - `type` is always preserved as the full event path
    - `undefined` values will remove the property from the result
    - Arrays are replaced, not concatenated

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

## Generic Parameters

FastEvent supports three generic type parameters for precise type control:

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Types extends keyof Events = keyof Events
>
```

1. `Events`: Defines the mapping between event types and their payload types
2. `Meta`: Defines the type of metadata that can be attached to events
3. `Types`: The union type of all event types (usually inferred from Events)

### Basic Type Safety

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

### Custom Metadata Types

```typescript
// Define metadata structure
interface MyMeta {
    timestamp: number;
    source: string;
}

// Define events with custom metadata
const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    // message.meta is typed as MyMeta
    const { timestamp, source } = message.meta;
    console.log(`Login from ${source} at ${timestamp}`);
});

// Emit with typed metadata
events.emit('user/login', { id: 1, name: 'Alice' }, false, { timestamp: Date.now(), source: 'web' });
```

### Advanced Type Usage

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

events.on('data/string', (message) => {
    const upper = message.payload.toUpperCase(); // payload is typed as string
});

events.on('data/object', (message) => {
    const value = message.payload.value; // payload is typed as { value: any }
});

// All emissions are type checked
events.emit('data/number', 42);
events.emit('data/string', 'hello');
events.emit('data/object', { value: true });
```

## Event Hooks

FastEvent provides several hooks for monitoring and debugging the event system:

```typescript
const events = new FastEvent({
    // Called when a new listener is added
    onAddListener: (path: string[], listener: Function) => {
        console.log('New listener added for:', path.join('/'));
    },

    // Called when a listener is removed
    onRemoveListener: (path: string[], listener: Function) => {
        console.log('Listener removed from:', path.join('/'));
    },

    // Called when listeners are cleared
    onClearListeners: () => {
        console.log('All listeners cleared');
    },

    // Called when a listener throws an error
    onListenerError: (type: string, error: Error) => {
        console.error(`Error in listener for ${type}:`, error);
    },

    // Called after listeners are executed (debug mode only)
    onExecuteListener: (message, returns, listeners) => {
        console.log('Event executed:', {
            type: message.type,
            payload: message.payload,
            results: returns,
            listenerCount: listeners.length,
        });
    },
});
```

These hooks provide valuable insights into the event system's operation:

1. `onAddListener`: Monitor listener registration

    - Called whenever a new event listener is added
    - Receives the event path array and listener function
    - Useful for tracking event subscriptions

2. `onRemoveListener`: Track listener removal

    - Called when a listener is removed
    - Helps monitor event unsubscription patterns
    - Receives the same parameters as onAddListener

3. `onClearListeners`: Notifies of bulk listener removal

    - Called when offAll() is invoked
    - Useful for cleanup monitoring
    - No parameters provided

4. `onListenerError`: Error handling hook

    - Called when a listener throws an error
    - Receives the event type and error object
    - Enables centralized error handling
    - Only called if ignoreErrors is true

5. `onExecuteListener`: Execution monitoring (debug mode)
    - Only active when debug: true is set
    - Provides detailed execution information
    - Includes message, return values, and listener list
    - Useful for debugging and performance monitoring

Example usage:

```typescript
const events = new FastEvent({
    debug: true, // Enable debug mode for onExecuteListener
    onAddListener: (path, listener) => {
        console.log(`Listener added for ${path.join('/')}`);
        // Track listener count or patterns
    },
    onListenerError: (type, error) => {
        console.error(`Error in ${type}:`, error);
        // Log to monitoring system
    },
    onExecuteListener: (message, returns, listeners) => {
        console.log(`Event ${message.type} executed:`, {
            executionTime: Date.now(),
            listenerCount: listeners.length,
            results: returns,
        });
        // Monitor event execution patterns
    },
});

// Example events that trigger hooks
events.on('user/login', () => {
    // onAddListener will be called
});

events.on('data/process', () => {
    throw new Error('Process failed');
    // onListenerError will be called
});

events.emit('user/login', { id: 1 });
// onExecuteListener will be called (if debug: true)

events.offAll();
// onClearListeners will be called
```

# Parameters

FastEvent constructor accepts the following configuration options:

````typescript
interface FastEventOptions<Meta = Record<string, any>, Context = any> {
    /**
     * Unique identifier for the emitter instance
     * @default Randomly generated string
     */
    id?: string;

    /**
     * Whether to enable debug mode
     * @default false
     * @remarks When true, events can be viewed in Redux DevTools
     */
    debug?: boolean;

    /**
     * Delimiter for event path segments
     * @default '/'
     * @example
     * ```ts
     * new FastEvent({ delimiter: '.' }); // Use dot as delimiter
     * ```
     */
    delimiter?: string;

    /**
     * Default execution context for event handlers
     * @default null
     */
    context?: Context;

    /**
     * Whether to ignore listener errors
     * @default true
     */
    ignoreErrors?: boolean;

    /**
     * Global metadata attached to all events
     * @default undefined
     */
    meta?: Meta;

    /**
     * Callback when a listener is added
     * @param path - Array of path segments
     * @param listener - The listener function
     */
    onAddListener?: (path: string[], listener: Function) => void;

    /**
     * Callback when a listener is removed
     * @param path - Array of path segments
     * @param listener - The listener function
     */
    onRemoveListener?: (path: string[], listener: Function) => void;

    /**
     * Callback when all listeners are cleared
     */
    onClearListeners?: () => void;

    /**
     * Callback when a listener throws an error
     * @param type - Event type
     * @param error - The error object
     */
    onListenerError?: (type: string, error: Error) => void;

    /**
     * Callback after listeners are executed (debug mode only)
     * @param message - Event message
     * @param returns - Array of listener return values
     * @param listeners - Array of executed listeners
     */
    onExecuteListener?: (message: FastEventMessage, returns: any[], listeners: (FastEventListener<any, any, any> | [FastEventListener<any, any>, number])[]) => void;
}

// Debug mode usage
import 'fastevent/devtools';
const emitter = new FastEvent({
    debug: true, // Enable debug mode to view events in Redux DevTools
});
````

# Performance

![](./bench.png)
