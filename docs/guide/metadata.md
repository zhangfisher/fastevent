# Metadata System

FastEvent's metadata system provides a powerful way to attach additional context information to events at different levels.

## Standard Message Format

All events in FastEvent follow this standardized format:

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // Complete event path (e.g. 'user/profile/update')
    payload: P; // Event-specific data
    meta: M; // Merged metadata from all levels
};
```

## Metadata Sources

FastEvent provides three levels of metadata:

### 1. Global Metadata

Set at the FastEvent instance level, applies to all events:

```typescript
const events = new FastEvent({
    meta: {
        version: '1.0',
        environment: 'production',
    },
});
```

### 2. Scope Metadata

Added when creating scopes, merges with global metadata:

```typescript
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

// Nested scopes
const profileScope = userScope.scope('profile', {
    meta: { section: 'profile' },
});
```

### 3. Event Metadata

Passed when emitting individual events:

```typescript
events.emit('event', data, false, {
    timestamp: Date.now(),
});
```

## Metadata Merging

### Priority Order

Metadata from different sources is merged with the following priority (highest to lowest):

1. Event-specific metadata
2. Scope metadata (innermost to outermost)
3. Global metadata
4. System metadata (type is always added)

### Merge Behavior

-   Top-level properties only (shallow merge)
-   Later values override earlier ones
-   Arrays are replaced, not concatenated
-   `undefined` values remove the property
-   `type` is always preserved as the full event path

## Complete Example

Here's a comprehensive example showing metadata merging across different levels:

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

userScope.emit('login', { id: 1 }, false, { timestamp: Date.now() });

userScope.on('login', (message) => {
    console.log(message.meta);
    // {
    //   type: 'user/login',
    //   app: 'MyApp',
    //   domain: 'user',
    //   timestamp: 1620000000000
    // }
});
```

## Type Safety with Metadata

For TypeScript users, metadata types can be strictly enforced:

```typescript
interface MyMeta {
    version: string;
    timestamp?: number;
}

const events = new FastEvent<MyEvents, MyMeta>({
    meta: { version: '1.0' }, // Required by MyMeta
});

// Type checked metadata
events.emit('event', {}, false, {
    timestamp: Date.now(), // Optional per MyMeta
});
```

## Best Practices

1. **Use Global Metadata** for application-wide constants:

    - Version numbers
    - Environment information
    - Application identifiers

2. **Use Scope Metadata** for domain-specific information:

    - Feature areas
    - User roles
    - Component identifiers

3. **Use Event Metadata** for transient information:

    - Timestamps
    - Request IDs
    - Operation-specific data

4. **Keep Metadata Light**:

    - Avoid large objects
    - Use only necessary fields
    - Consider performance impact

5. **Type Your Metadata**:
    - Define interfaces for metadata
    - Use TypeScript's type system
    - Document expected fields
