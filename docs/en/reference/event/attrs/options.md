# Options

Configuration parameters.

```ts
type FastEventOptions<Meta = Record<string, any>, Context = any> = {
    id?: string;
    debug?: boolean;
    // Event delimiter
    delimiter?: string;
    // Execution context for listener functions
    context?: Context;
    // Whether to ignore errors thrown by listener functions, defaults to true
    ignoreErrors?: boolean;
    // Extra global metadata, passed to listeners when an event is emitted
    meta?: Meta;
    // Callback when a new listener is created
    onAddListener?: (type: string[], listener: FastEventListener) => void;
    // Callback when a listener is removed
    onRemoveListener?: (type: string[], listener: FastEventListener) => void;
    // Callback when all listeners are cleared
    onClearListeners?: () => void;
    // Callback when a listener function throws an error, used for diagnostics; can print the error
    onListenerError?: (type: string, error: Error) => void;
    // Callback before executing a listener; returning false cancels execution
    onBeforeExecuteListener?: (message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void;
    // Callback after executing a listener
    onAfterExecuteListener?: (message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void;
    // Global executor
    executor?: FastListenerExecutorArgs;
};
```
