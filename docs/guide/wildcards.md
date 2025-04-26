# Wildcards

FastEvent supports powerful wildcard patterns for event subscription, allowing you to handle multiple events with a single listener.

## Wildcard Types

FastEvent supports two types of wildcards:

### 1. Single-Level Wildcard (\*)

The `*` wildcard matches exactly one level in the event path:

```typescript
const events = new FastEvent();

// Match any user type
events.on('user/*/login', (message) => {
    const userType = message.type.split('/')[1];
    console.log('User type:', userType);
});

// Will match:
events.emit('user/admin/login', data); // User type: admin
events.emit('user/guest/login', data); // User type: guest

// Won't match:
events.emit('user/login', data); // Missing middle segment
events.emit('user/a/b/login', data); // Too many segments
```

### 2. Multi-Level Wildcard (\*\*)

The `**` wildcard matches zero or more levels in the event path:

```typescript
const events = new FastEvent();

// Match all user-related events
events.on('user/**', (message) => {
    console.log('User event:', message.type);
});

// Will match:
events.emit('user/login', data);
events.emit('user/profile/update', data);
events.emit('user/settings/theme/change', data);
```

## Important Rules

1. `**` wildcard must be at the end of the path

```typescript
// Valid
events.on('api/**', handler);

// Invalid - will not work as expected
events.on('api/**/users', handler);
```

2. `*` can be used multiple times in a path

```typescript
// Valid - matches any action on any resource
events.on('api/*/action/*', handler);
```

3. Wildcards cannot be combined in a single segment

```typescript
// Invalid
events.on('api/**/*', handler);
events.on('user/**/login', handler);
```

## Accessing Matched Segments

When using wildcards, you can access the matched segments through the event type:

```typescript
events.on('api/*/users/*/action', (message) => {
    const [, version, , userId] = message.type.split('/');
    console.log(`API ${version} - User ${userId}`);
});

events.emit('api/v1/users/123/action', data);
// Logs: "API v1 - User 123"
```

## Performance Considerations

1. **Pattern Specificity**:

    - Specific patterns (without wildcards) are matched faster
    - `*` wildcards are more efficient than `**`
    - Limit use of `**` wildcards for better performance

2. **Pattern Order**:
    - More specific patterns should be registered first
    - `**` patterns should be registered last
    - Consider the order of pattern matching

## Type Safety with Wildcards

While TypeScript provides type safety for exact event types, wildcard listeners require careful handling:

```typescript
interface ApiEvents {
    'api/users/create': { name: string };
    'api/users/delete': { id: number };
}

const events = new FastEvent<ApiEvents>();

// Exact match - fully typed
events.on('api/users/create', (message) => {
    const { name } = message.payload; // typed as { name: string }
});

// Wildcard - payload type is 'any'
events.on('api/users/*', (message) => {
    // message.payload type is not preserved
    console.log('API event:', message.type);
});
```

## Best Practices

1. **Use Specific Patterns When Possible**:

    - Prefer exact matches over wildcards
    - Use `*` instead of `**` when possible
    - Keep patterns as specific as practical

2. **Organize Event Hierarchies**:

    - Design event paths with wildcards in mind
    - Group related events logically
    - Consider pattern matching performance

3. **Handle Type Safety**:

    - Be aware of type limitations with wildcards
    - Add runtime type checks when needed
    - Document expected payload types

4. **Monitor Performance**:

    - Watch for slow pattern matching
    - Optimize wildcard usage
    - Consider the number of listeners

5. **Clean Documentation**:
    - Document wildcard patterns
    - Explain matching behavior
    - Provide clear examples
