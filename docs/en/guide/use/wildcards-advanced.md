# Multi-level Events and Wildcards

FastEvent provides a powerful multi-level event matching system, supporting flexible event routing and handling.

## Multi-level Event Structure

### Hierarchy Delimiter

Uses `/` as the delimiter by default, which can be customized:

```typescript
// Use a custom delimiter
const emitter = new FastEvent({
    delimiter: ':', // Use a colon as the delimiter
});

emitter.on('user:login', handler);
```

### Event Hierarchy Examples

```typescript
// System events
'system/start';
'system/shutdown';

// User events
'user/login';
'user/profile/update';
'user/notifications/new';

// Order events
'order/create';
'order/update/status';
'order/items/add';
```

## Wildcard Matching Rules

### Single Level Wildcard (\*)

Matches any event within a single level:

```typescript
// Match all events whose first level is user
emitter.on('user/*', handler);
// Matches: user/login, user/logout
// Does not match: user/profile/update
```

### Multi-level Wildcard (\*\*)

Matches paths at any level:

```typescript
// Match all events under user
emitter.on('user/**', handler);
// Matches: user/login, user/profile/update
```

### Mixed Wildcards

```typescript
// Match all update operations
emitter.on('*/update', handler);

// Match all events whose second level is status
emitter.on('*/*/status', handler);
```

## Type-safe Matching

```typescript
interface AppEvents {
    'user/login': { id: string };
    'user/logout': { id: string };
    'user/profile/update': { name: string };
    'system/start': void;
}

const emitter = new FastEvent<AppEvents>();

// Type-safe wildcard listener
emitter.on('user/*', (message) => {
    // message.payload is typed as { id: string }
    console.log(message.payload.id);
});

emitter.on('user/**', (message) => {
    if (message.type === 'user/profile/update') {
        // Inferred type is { name: string }
        console.log(message.payload.name);
    } else {
        // Inferred type is { id: string }
        console.log(message.payload.id);
    }
});
```

## Matching Priority

1. **Exact Match**: Highest priority
2. **Single Level Wildcard**: Medium priority
3. **Multi-level Wildcard**: Lowest priority

```typescript
emitter.on('user/login', () => console.log('Exact'));
emitter.on('user/*', () => console.log('Single-level wildcard'));
emitter.on('**', () => console.log('Multi-level wildcard'));

emitter.emit('user/login');
// Output order:
// Exact
// Single-level wildcard
// Multi-level wildcard
```

## Use Cases

### Modular Event Handling

```typescript
// The user module handles all user events
emitter.on('user/**', userModule.handle);

// The order module handles all order events
emitter.on('order/**', orderModule.handle);
```

### Global Logging

```typescript
// Log all events
emitter.on('**', (message) => {
    logger.log(`[${message.type}]`, message.payload);
});
```

### Permission Interception

```typescript
// Intercept all admin operations
emitter.on('admin/**', (message) => {
    if (!currentUser.isAdmin) {
        throw new Error('Access denied');
    }
});
```
