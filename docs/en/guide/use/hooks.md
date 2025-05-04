# Event Hooks

FastEvent provides rich lifecycle hooks that allow you to inject custom logic at key points in event processing.

## onAddListener

Triggered when adding a new event listener.

```typescript
const emitter = new FastEvent({
    onAddListener(parts, listener) {
        // parts: Event path array, like ['user', 'login']
        // listener: Listener function
        console.log(`Adding listener: ${parts.join('/')}`);
        console.log('Listener function:', listener);
    },
});
```

## onRemoveListener

Triggered when removing an event listener.

```typescript
const emitter = new FastEvent({
    onRemoveListener(parts, listener) {
        // parts: Event path array
        // listener: Removed listener function
        console.log(`Removing listener: ${parts.join('/')}`);
    },
});
```

## onListenerError

Triggered when a listener execution encounters an error.

```typescript
const emitter = new FastEvent({
    onListenerError(event, error) {
        // event: Event type
        // error: Error object
        console.error(`Error handling event ${event}:`, error);

        // Return true indicates error has been handled, won't be thrown
        return true;
    },
});
```

## onClearListeners

Triggered when calling offAll() to clear all listeners.

```typescript
const emitter = new FastEvent({
    onClearListeners() {
        console.log('All listeners have been cleared');
    },
});
```

## onBeforeExecuteListener

Triggered before executing a listener, can be used to intercept event execution.

```typescript
const emitter = new FastEvent({
    onBeforeExecuteListener(message, args) {
        // message: Event message object, containing type and payload
        // args: Event arguments
        console.log(`Preparing to execute event: ${message.type}`);

        // Returning false can prevent event execution
        if (message.type.startsWith('restricted/')) {
            return false;
        }
    },
});
```

## onAfterExecuteListener

Triggered after all listeners have completed execution.

```typescript
const emitter = new FastEvent({
    onAfterExecuteListener(message, results, listeners) {
        // message: Event message object
        // results: Array of all listener execution results
        // listeners: Executed listener node data
        console.log(`Event ${message.type} execution completed`);
        console.log('Execution results:', results);
    },
});
```