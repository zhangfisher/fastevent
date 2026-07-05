# Event Wildcards

FastEvent provides powerful wildcard capabilities to flexibly match multiple events.

## Wildcard Types

### Single-Level Wildcard (\*)

Matches any event within a single path level:

```typescript
// Listen to all direct child events under user
emitter.on('user/*', (message) => {
    console.log(`User event: ${message.type}`);
    // Matches: user/login, user/logout
    // Does not match: user/profile/update
});
```

### Multi-level Wildcard (\*\*)

Matches events at any path depth:

```typescript
// Listen to all events under user at any level
emitter.on('user/**', (message) => {
    console.log(`User-related event: ${message.type}`);
    // Matches: user/login, user/profile/update
});
```

## Wildcard Rules

1. **Delimiter**: Uses `/` as the path delimiter by default.
2. **Priority**: Exact match > Single-level wildcard > Multi-level wildcard.
3. **Performance**: Wildcard listeners are slightly slower than exact matches.

## Type Safety Example

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'user/profile/update': { name: string };
    'order/create': { orderId: string };
}

const emitter = new FastEvent<AppEvents>();

// Type-safe wildcard listener
emitter.on('user/*', (message) => {
    // message.payload is typed as { userId: string }
    // because it only matches user/login and user/logout
    console.log(message.payload.userId);
});

emitter.on('user/**', (message) => {
    // message.payload is typed as { userId: string } | { name: string }
    if (message.type === 'user/profile/update') {
        console.log(message.payload.name);
    } else {
        console.log(message.payload.userId);
    }
});
```

## Use Cases

1. **Logging**: Listen to a group of related events

```typescript
emitter.on('**', (message) => {
    logger.log(`[${message.type}]`, message.payload);
});
```

2. **Permission Checks**: Intercept events in a specific domain

```typescript
emitter.on('admin/**', (message) => {
    if (!currentUser.isAdmin) {
        throw new Error('Access denied');
    }
});
```

3. **Data Aggregation**: Collect related event data

```typescript
const analyticsData = {};

emitter.on('analytics/**', (message) => {
    analyticsData[message.type] = message.payload;
});
```
