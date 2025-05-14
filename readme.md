# FastEvent

[WebSite](https://zhangfisher.github.io/fastevent/)

`FastEvent` is a well-designed, powerful, type-safe, and thoroughly tested event emitter that provides robust event subscription and publishing mechanisms, suitable for both `nodejs/browser` environments.

# Installation

```bash
npm install fastevent
yarn add fastevent
pnpm add fastevent
bun add fastevent
```

# Guide

## Event Publishing and Subscription

`FastEvent` provides complete event emission and subscription functionality, with an `API` design inspired by `eventemitter2`.

```typescript
import { FastEvent } from 'fastevent';
const events = new FastEvent();

// Basic event publishing
const results = events.emit('user/login', { id: 1 });

// Asynchronous event emission
const results = await events.emitAsync('data/process', { items: [...] });

// Event subscription
events.on('user/login', (message) => {
    console.log('User login:', message.payload);
});

// One-time listener
events.once('startup', () => console.log('Application has started'));

// Listener with options
events.on('data/update', handler, {
    count: 3,       // Maximum trigger count
    prepend: true,  // Add to the beginning of the queue
    filter: (msg) => msg.payload.important // Only process important updates
});

// Global listener
events.onAny((message) => {
    console.log('Event occurred:', message.type);
});
```

## Event Messages

Listener functions receive a `Message` object that contains the following properties:

```ts
events.on('user/login', (message) => {
    // {
    //     type: 'user/login', // Event name
    //     payload: { id: 1 }, // Event data
    //     meta: {...}         // Event metadata
    // }
});
```

## Retained Events

Retain the last event data, so subsequent subscribers can immediately receive the event value upon subscription:

```typescript
const events = new FastEvent();

// Publish and retain event
events.emit('config/theme', { dark: true }, true);
// Equivalent to
events.emit('config/theme', { dark: true }, { retain: true });

// Subsequent subscribers immediately receive the retained value
events.on('config/theme', (message) => {
    console.log('Theme:', message.payload); // Immediately outputs: { dark: true }
});
```

## Hierarchical Event Publishing

`FastEvent` supports hierarchical event publishing and subscription.

-   The default event hierarchy delimiter is `/`, which can be modified via `options.delimiter`
-   Two types of wildcards are supported when subscribing to events: `*` matches a single path level, `**` matches multiple path levels (only used at the end of event names)

```typescript
const events = new FastEvent();

// Match user/*/login
events.on('user/*/login', (message) => {
    console.log('Any user type login:', message.payload);
});

// Match all events under user
events.on('user/**', (message) => {
    console.log('All user-related events:', message.payload);
});

// Trigger events
events.emit('user/admin/login', { id: 1 }); // Both handlers will be called
events.emit('user/admin/profile/update', { name: 'New' }); // Only the ** handler will be called
```

## Removing Listeners

`FastEvent` provides multiple ways to remove listeners:

```typescript
// Return a subscriber object to remove the listener, recommended approach
const subscriber = events.on('user/login', handler);
subscriber.off();

// Remove a specific listener
events.off(listener);
// Remove all listeners for a specific event
events.off('user/login');
// Remove a specific listener for a specific event
events.off('user/login', listener);
// Remove listeners using wildcard patterns
events.off('user/*');
// Remove all listeners
events.offAll();
// Remove all listeners under a specific prefix
events.offAll('user');
```

## Event Scopes

Scopes allow you to handle events within a specific namespace.

**Note** that scopes share the same listener table with the parent event emitter:

```typescript
const events = new FastEvent();

// Create a user-related scope
const userScope = events.scope('user');

// The following two approaches are equivalent:
userScope.on('login', handler);
events.on('user/login', handler);

// The following two approaches are also equivalent:
userScope.emit('login', data);
events.emit('user/login', data);

// Clear all listeners in the scope
userScope.offAll(); // Equivalent to events.offAll('user')
```

## Waiting for Events

Use `waitFor` to wait for a specific event to occur, with timeout support.

```typescript
const events = new FastEvent();

async function waitForLogin() {
    try {
        // Wait for login event with a 5-second timeout
        const userData = await events.waitFor('user/login', 5000);
        console.log('User logged in:', userData);
    } catch (error) {
        console.log('Login wait timeout');
    }
}

waitForLogin();
// Later trigger the login event
events.emit('user/login', { id: 1, name: 'Alice' });
```

## Event Hooks

`FastEvent` provides multiple hook functions for operations at different stages of the event emitter lifecycle.

```typescript
const otherEvents = new FastEvent();
const events = new FastEvent({
    // Called when a new listener is added
    onAddListener: (type, listener, options) => {
        console.log('Added new listener:', type);
        // Return false to prevent the listener from being added
        return false;
        // Can directly return a FastEventSubscriber
        // For example: transfer events starting with `@` to another FastEvent
        if (type.startsWith('@')) {
            return otherEvents.on(type, listener, options);
        }
    },
    // Called when a listener is removed
    onRemoveListener: (type, listener) => {
        console.log('Removed listener:', type);
    },
    // Called when listeners are cleared
    onClearListeners: () => {
        console.log('All listeners cleared');
    },
    // Called when a listener throws an error
    onListenerError: (error, listener, message, args) => {
        console.error(`Error in listener for event ${message.type}:`, error);
    },
    // Called before a listener executes
    onBeforeExecuteListener: (message, args) => {
        console.log('Before executing event listener');
        // Return false to prevent listener execution
        return false;

        // Forward events to another FastEvent
        // For example: forward events starting with `@` to another FastEvent
        if (type.startsWith('@')) {
            return otherEvents.emit(message.type);
        }
    },
    // Called after a listener executes
    onAfterExecuteListener: (message, returns, listeners) => {
        console.log('After executing event listener');
        // Can intercept and modify return values here
    },
});
```

## Executors

By default, all listeners are executed in parallel when an event is triggered.

`FastEvent` provides powerful listener execution mechanisms that allow developers to control how listeners are executed.

```typescript
import { race } from 'fastevent/executors';
const events = new FastEvent({
    executor: race(),
});

events.on('task/start', async () => {
    /* Time-consuming operation 1 */
});
events.on('task/start', async () => {
    /* Time-consuming operation 2 */
});

// The two listeners will execute in parallel, returning the fastest result
await events.emitAsync('task/start');
```

**Built-in Support**:

| Executor                                  | Description                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `parallel`                                | Default, concurrent execution                                             |
| `race`                                    | Parallel executor, uses `Promise.race` for parallel execution             |
| `balance`                                 | Evenly distributed executor                                               |
| `first`                                   | Execute only the first listener                                           |
| `last`                                    | Execute only the last listener                                            |
| `random`                                  | Randomly select a listener                                                |
| `series`                                  | Serial executor, execute listeners in sequence and return the last result |
| `waterfall`                               | Execute listeners in sequence and return the last result, abort on error  |
| `(listeners,message,args,execute)=>any[]` | Custom executor                                                           |

## Listener Pipes

Listener pipes are used to wrap listener functions during event subscription to implement various common advanced features.

```typescript
import { queue } from 'fastevent/pipes';
const events = new FastEvent();

// default queue size is 10
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

**Built-in Support:**

| Pipe       | Description                                                                      |
| ---------- | -------------------------------------------------------------------------------- |
| `queue`    | Queue listener, process messages in queue, supports priority and timeout control |
| `throttle` | Throttle listener                                                                |
| `debounce` | Debounce listener                                                                |
| `timeout`  | Timeout listener                                                                 |
| `retry`    | Retry listener, for controlling retries after listener execution failure         |
| `memorize` | Cache listener, cache listener execution results                                 |

## Forwarding Publishing and Subscription

`FastEvent` can elegantly forward publishing and subscription to another `FastEvent` instance.

```ts
import { expandable } from 'fastevent';
const otherEmitter = new FastEvent();
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // Subscription forwarding rule: when event name starts with `@/`, forward subscription to another `FastEvent` instance
        if (type.startsWith('@/')) {
            return otherEmitter.on(type.substring(2), listener, options);
        }
    },
    onBeforeExecuteListener: (message, args) => {
        // Event forwarding rule: when event name starts with `@/`, publish to another `FastEvent` instance
        if (message.type.startsWith('@/')) {
            message.type = message.type.substring(2);
            return expandable(otherEmitter.emit(message, args));
        }
    },
});
const events: any[] = [];
otherEmitter.on('data', ({ payload }) => {
    events.push(payload);
});
// Subscribe to otherEmitter's data event
emitter.on('@/data', ({ payload }) => {
    expect(payload).toBe(1);
    events.push(payload);
});
// Publish data event to otherEmitter
const subscriber = emitter.emit('@/data', 1);
subscriber.off();
```

## Metadata (Meta)

Metadata is a mechanism for providing additional contextual information for events.

You can set metadata at different levels: global, scope level, or event-specific level.

```typescript
const events = new FastEvent({
    meta: {
        version: '1.0',
        environment: 'production',
    },
});

events.on('user/login', (message) => {
    console.log('Event data:', message.payload);
    console.log('Metadata:', message.meta); // Includes type, version, and environment
});

// Using scope-level metadata
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});
// Add specific metadata when publishing events
userScope.emit(
    'login',
    { userId: '123' },
    {
        meta: { timestamp: Date.now() }, // Event-specific metadata
    },
);

// Listeners receive merged metadata
userScope.on('login', (message) => {
    console.log('Metadata:', message.meta);
});
```

## Event Type Definitions

`FastEvent` has complete `TypeScript` type support.

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
    const sum = message.payload + 1; // payload type is number
});

// All event emissions are type-checked
events.emit('data/number', 42);
events.emit('data/string', 'hello');
events.emit('data/object', { value: true });
```

## Unit Testing

`FastEvent` has been thoroughly unit tested, with over `280+` cumulative test cases and `99%+` test coverage.

## License

MIT

For more detailed documentation, see [WebSite](https://zhangfisher.github.io/fastevent/)
