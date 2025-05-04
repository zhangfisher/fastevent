# Event Scopes

FastEvent's scope feature allows you to create independent event namespaces for modular event management.

## Quick Start

### Creating a Scope

```typescript
const emitter = new FastEvent();
// Create a scope for user-related events
const userScope = emitter.scope('user');
```

- `emitter.scope('user')` returns a `Scope` object that inherits all methods from `FastEvent`, so you can continue using `on`, `once`, `off` etc.
- Events emitted from `scope.emit` automatically get the scope prefix: `user/<event-name>`
- Listeners registered via `scope.on` and `scope.once` receive `message.type` with the scope prefix removed.

### Emitting Scoped Events

Events emitted within a scope automatically get the scope prefix:

```typescript
// Emit login event within userScope
// Actually emits 'user/login' event
userScope.emit('login', { userId: '123' });
```

- Scoped events automatically get the scope prefix. The above code actually emits `user/login`, which can be normally received.

### Receiving Scoped Events

```typescript
// Receive login event within userScope
userScope.on('login', (message) => {
    console.log(message.type); // 'login'
});
```

- The `scope` method returns a `Scope` object that inherits all `FastEvent` methods.
- The scope shares the same subscription list with the emitter, so you can also receive scoped events directly from the emitter.

```typescript
// Receive userScope's login event from emitter
emitter.on('user/login', (message) => {
    console.log(message);
});
```

## Guide

### Creating Scopes

Event scopes can be created via `emitter.scope` or `scope.scope()`:

```typescript
const emitter = new FastEvent();

// Create scope for user-related events
const userScope = emitter.scope('user');
// Create nested scope
const profileScope = userScope.scope('profile');
```

### Nested Scopes

Scopes can be nested, with child scopes inheriting parent's event type definitions:

```typescript
const emitter = new FastEvent();

// Create user scope
const userScope = emitter.scope('user');

// Create nested profile scope
const profileScope = userScope.scope('profile');
```

### Metadata

Scopes can have metadata that merges with parent's metadata:

```typescript
const emitter = new FastEvent({
    meta: { root: 1 },
});

const scope = emitter.scope('a/b/c', {
    meta: { c: 1 },
});

scope.on('a/b/c', (message) => {
    message.meta; // { root: number, c: number, scope:string }
});
```

- `scope.meta` merges with parent's metadata
- Automatically injects a `scope` property indicating current scope name

For more on metadata, see [Metadata](./metadata.md)

### Context

Context refers to the `this` object in listener functions. Scopes override the context:

```typescript
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context,
});

const scopeContext = { a: 1, b: 2 };
const scope = emitter.scope('user', {
    context: scopeContext,
});

scope.on('hello', function() {
    this === scopeContext; // true
});
```

For more on context, see [Context](./context.md)

### Executors

Scopes can configure their own listener executors:

```typescript
const emitter = new FastEvent();
const scope = emitter.scope('user', {
    executor: 'race',
});
```

For more on executors, see [Executor](./executor.md)

### Type Safety

Scopes inherit parent's event type definitions:

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'user/profile/update': { name: string };
}

const emitter = new FastEvent<AppEvents>();
const userScope = emitter.scope('user');

// Type checks pass
userScope.emit('login', { userId: '123' }); // ✅

// Type errors
userScope.emit('login', { userId: 123 }); // ❌
userScope.emit('unknown', {}); // ❌
```

## Use Cases

### Modular Development

```typescript
// user.module.ts
export function createUserModule(emitter: FastEvent) {
    const scope = emitter.scope('user');

    scope.on('login', handleLogin);
    scope.on('logout', handleLogout);

    return {
        login: (data) => scope.emit('login', data),
        logout: () => scope.emit('logout'),
    };
}
```

### Plugin System

```typescript
// plugin.ts
function installPlugin(emitter: FastEvent) {
    const pluginScope = emitter.scope('plugin/analytics');

    // Plugin uses its own event namespace
    pluginScope.on('track', trackEvent);

    return {
        track: (event) => pluginScope.emit('track', event),
    };
}
```

### Micro-frontend Communication

```typescript
// app1.js
const scope = emitter.scope('app1');
scope.emit('state/update', { data: '...' });

// app2.js
emitter.on('app1/state/update', handleUpdate);
```