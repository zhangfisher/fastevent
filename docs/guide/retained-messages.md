# Retained Messages

Retained messages are events that are stored and automatically delivered to new subscribers. This feature is particularly useful for maintaining state or configuration information that new subscribers need to know about.

## Basic Usage

### Publishing Retained Messages

Set the `retain` parameter to `true` when emitting events:

```typescript
const events = new FastEvent();

// Emit and retain the event
events.emit('config/theme', { mode: 'dark' }, true);

// Later subscribers will immediately receive the retained message
events.on('config/theme', (message) => {
    console.log('Current theme:', message.payload);
    // Logs: "Current theme: { mode: 'dark' }"
});
```

### Checking Retained Messages

You can check if a message is retained and retrieve it:

```typescript
// Check if a message is retained
const hasRetained = events.hasRetained('config/theme');

// Get the retained message
const retainedMessage = events.getRetained('config/theme');
if (retainedMessage) {
    console.log('Retained message:', retainedMessage);
}
```

## Managing Retained Messages

### Clearing Specific Messages

Remove specific retained messages:

```typescript
// Clear a specific retained message
events.clearRetained('config/theme');

// Check if cleared
console.log(events.hasRetained('config/theme')); // false
```

### Clearing All Messages

Remove all retained messages:

```typescript
// Clear all retained messages
events.clearAllRetained();
```

## Scopes and Retained Messages

Retained messages work with scopes:

```typescript
const events = new FastEvent();
const configScope = events.scope('config');

// Emit retained message in scope
configScope.emit('theme', { mode: 'dark' }, true);

// These are equivalent:
events.hasRetained('config/theme');
configScope.hasRetained('theme');

// Clear retained messages in scope
configScope.clearRetained('theme'); // Clears specific message
configScope.clearAllRetained(); // Clears all in scope
```

## Use Cases

### 1. Configuration Management

```typescript
const configEvents = events.scope('config');

// Set initial configuration
configEvents.emit(
    'settings',
    {
        theme: 'dark',
        language: 'en',
        notifications: true,
    },
    true,
);

// Components can get current config when they initialize
configEvents.on('settings', (message) => {
    initializeComponent(message.payload);
});
```

### 2. State Broadcasting

```typescript
const systemEvents = events.scope('system');

// Broadcast system state
systemEvents.emit(
    'status',
    {
        online: true,
        lastUpdate: Date.now(),
    },
    true,
);

// New components automatically get current status
systemEvents.on('status', (message) => {
    updateConnectionStatus(message.payload);
});
```

### 3. Feature Flags

```typescript
const featureEvents = events.scope('features');

// Set feature flags
featureEvents.emit(
    'flags',
    {
        newUI: true,
        beta: false,
    },
    true,
);

// Components check features when initializing
featureEvents.on('flags', (message) => {
    enableFeatures(message.payload);
});
```

## Type Safety

Use TypeScript to ensure type safety with retained messages:

```typescript
interface ConfigEvents {
    'config/theme': {
        mode: 'light' | 'dark';
        accent?: string;
    };
}

const events = new FastEvent<ConfigEvents>();

// Type-safe emit
events.emit('config/theme', { mode: 'dark' }, true);

// Type error:
events.emit('config/theme', { mode: 'invalid' }, true);
```

## Best Practices

1. **Use Sparingly**:

    - Only retain essential state information
    - Consider memory usage
    - Clear unnecessary retained messages

2. **Scope Organization**:

    - Group related retained messages
    - Use clear naming conventions
    - Maintain scope hierarchy

3. **State Management**:

    - Keep retained data small
    - Update when state changes
    - Clear outdated state

4. **Type Safety**:

    - Define interfaces for retained messages
    - Use TypeScript for type checking
    - Document message structures

5. **Memory Management**:

    - Monitor retained message count
    - Clear messages when no longer needed
    - Avoid retaining large payloads

6. **Error Handling**:
    - Handle missing retained messages
    - Validate retained data
    - Provide fallback values
