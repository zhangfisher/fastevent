# Event Hooks

FastEvent provides several hooks for monitoring and debugging the event system. These hooks allow you to track listener registration, execution, and errors.

## Available Hooks

FastEvent supports the following hooks:

### Listener Management Hooks

1. **onAddListener**

```typescript
const events = new FastEvent({
    onAddListener: (path: string[], listener: Function) => {
        console.log('New listener added for:', path.join('/'));
    },
});
```

2. **onRemoveListener**

```typescript
const events = new FastEvent({
    onRemoveListener: (path: string[], listener: Function) => {
        console.log('Listener removed from:', path.join('/'));
    },
});
```

3. **onClearListeners**

```typescript
const events = new FastEvent({
    onClearListeners: () => {
        console.log('All listeners cleared');
    },
});
```

### Error Handling Hook

**onListenerError**

```typescript
const events = new FastEvent({
    ignoreErrors: true, // Required for error handling
    onListenerError: (type: string, error: Error) => {
        console.error(`Error in listener for ${type}:`, error);
        // Log to monitoring system
    },
});
```

### Execution Monitoring Hook

**onExecuteListener** (debug mode only)

```typescript
const events = new FastEvent({
    debug: true, // Required for execution monitoring
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

## Complete Example

Here's a comprehensive example showing all hooks in action:

```typescript
const events = new FastEvent({
    debug: true,
    ignoreErrors: true,

    // Listener management
    onAddListener: (path, listener) => {
        console.log(`Listener added for ${path.join('/')}`);
    },
    onRemoveListener: (path, listener) => {
        console.log(`Listener removed from ${path.join('/')}`);
    },
    onClearListeners: () => {
        console.log('All listeners cleared');
    },

    // Error handling
    onListenerError: (type, error) => {
        console.error(`Error in ${type}:`, error);
    },

    // Execution monitoring
    onExecuteListener: (message, returns, listeners) => {
        console.log(`Event ${message.type} executed:`, {
            timestamp: Date.now(),
            listenerCount: listeners.length,
            results: returns,
        });
    },
});

// Example usage
events.on('user/login', () => {
    // onAddListener will be called
    console.log('User logged in');
});

events.on('data/process', () => {
    throw new Error('Process failed');
    // onListenerError will be called
});

events.emit('user/login', { id: 1 });
// onExecuteListener will be called

events.offAll();
// onClearListeners will be called
```

## Use Cases

### 1. Debugging and Monitoring

```typescript
const events = new FastEvent({
    debug: true,
    onExecuteListener: (message, returns, listeners) => {
        console.log('Event Performance:', {
            type: message.type,
            executionTime: Date.now() - message.meta.startTime,
            listenerCount: listeners.length,
        });
    },
});
```

### 2. Error Tracking

```typescript
const events = new FastEvent({
    ignoreErrors: true,
    onListenerError: (type, error) => {
        errorTrackingService.report({
            eventType: type,
            error: error,
            timestamp: Date.now(),
        });
    },
});
```

### 3. Listener Analytics

```typescript
const events = new FastEvent({
    onAddListener: (path) => {
        analytics.track('event_subscription', {
            path: path.join('/'),
            timestamp: Date.now(),
        });
    },
});
```

## Best Practices

1. **Debug Mode Usage**:

    - Enable only during development/testing
    - Use for performance monitoring
    - Disable in production if not needed

2. **Error Handling**:

    - Always handle errors appropriately
    - Log errors for monitoring
    - Consider error recovery strategies

3. **Performance Monitoring**:

    - Track execution times
    - Monitor listener counts
    - Watch for patterns in errors

4. **Clean Up**:

    - Track listener addition/removal
    - Monitor for potential memory leaks
    - Ensure proper cleanup

5. **Production Usage**:
    - Consider performance impact
    - Log only necessary information
    - Handle errors gracefully
