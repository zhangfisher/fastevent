# Event Message Format

FastEvent uses a standardized message format for all events. Understanding this format is essential for working with the library effectively.

## Message Structure

### Basic Format

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // Event type/path
    payload: P; // Event data
    meta: M; // Metadata
};
```

### Type Parameters

-   `T`: Event type (usually string)
-   `P`: Payload type
-   `M`: Metadata type

## Publishing Events

### Method 1: Parameters Form

```typescript
const events = new FastEvent();

// Basic emit
events.emit('user/login', { id: 1, name: 'Alice' });

// With retain flag and metadata
events.emit(
    'user/login', // Event type
    { id: 1, name: 'Alice' }, // Payload
    true, // Retain flag
    { timestamp: Date.now() }, // Metadata
);
```

### Method 2: Message Object Form

```typescript
const events = new FastEvent();

events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
    meta: { timestamp: Date.now() },
});
```

## Receiving Events

### Event Handlers

Event handlers receive the complete message object:

```typescript
events.on('user/login', (message) => {
    console.log('Event type:', message.type);
    console.log('User data:', message.payload);
    console.log('Metadata:', message.meta);
});
```

### Type Safety

Use TypeScript interfaces to ensure type safety:

```typescript
interface MyEvents {
    'user/login': {
        id: number;
        name: string;
    };
    'user/logout': {
        id: number;
    };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    // message.payload is typed as { id: number; name: string }
    const { id, name } = message.payload;

    // message.meta is typed as MyMeta
    const { timestamp, source } = message.meta;
});
```

## Event Paths

### Path Format

Event paths use a delimiter (default is '/') to create hierarchies:

```typescript
// Default delimiter '/'
events.emit('user/profile/update', data);

// Custom delimiter
const events = new FastEvent({ delimiter: '.' });
events.emit('user.profile.update', data);
```

### Path Components

Event paths typically follow a hierarchical structure:

```typescript
// Format: domain/entity/action
events.emit('user/profile/update', data);
events.emit('system/config/change', data);
events.emit('api/users/create', data);
```

## Metadata Handling

### System Metadata

FastEvent automatically adds some system metadata:

```typescript
events.on('user/login', (message) => {
    console.log(message.meta);
    // Always includes:
    // - type: full event path
    // Other system metadata may be added in future versions
});
```

### Custom Metadata

Add custom metadata at different levels:

```typescript
// Global metadata (constructor)
const events = new FastEvent({
    meta: { app: 'MyApp', version: '1.0' },
});

// Scope metadata
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

// Event metadata
userScope.emit('login', data, false, {
    timestamp: Date.now(),
});
```

## Best Practices

1. **Event Naming**:

    - Use clear, descriptive paths
    - Follow consistent naming patterns
    - Consider path hierarchy

2. **Payload Design**:

    - Keep payloads focused
    - Include necessary data only
    - Consider serialization

3. **Metadata Usage**:

    - Use for cross-cutting concerns
    - Keep metadata lightweight
    - Document metadata fields

4. **Type Safety**:

    - Define event interfaces
    - Type metadata properly
    - Use TypeScript features

5. **Error Handling**:

    - Validate payloads
    - Handle missing data
    - Consider error events

6. **Performance**:
    - Monitor payload size
    - Optimize message structure
    - Consider serialization costs
