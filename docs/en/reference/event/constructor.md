# Constructor

The core event emitter class `FastEvent` provides publish/subscribe functionality, supporting:

-   Event subscription (on/once)
-   Event emission (emit/emitAsync)
-   Wildcard matching
-   Event scopes (scope)
-   Retained events (retain)
-   Asynchronous event handling

## Constructor

```ts
constructor(options?: FastEventOptions<Meta, Context>)


 type FastEventOptions<Meta = Record<string, any>, Context = any> = {
    id?: string
    debug?: boolean
    // Event delimiter
    delimiter?: string
    // Execution context for listener functions
    context?: Context
    // Whether to ignore errors thrown by listener functions, defaults to true
    ignoreErrors?: boolean
    // Extra global metadata, passed to listeners when an event is emitted
    meta?: Meta
    // Callback when a new listener is created
    onAddListener?: (type: string[], listener: FastEventListener) => void
    // Callback when a listener is removed
    onRemoveListener?: (type: string[], listener: FastEventListener) => void
    // Callback when all listeners are cleared
    onClearListeners?: () => void
    // Callback when a listener function throws an error, used for diagnostics; can print the error
    onListenerError?: ((type: string, error: Error) => void)
    // Callback before executing a listener; returning false cancels execution
    onBeforeExecuteListener?: (message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void
    // Callback after executing a listener
    onAfterExecuteListener?: (message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void
    // Global executor
    executor?: FastListenerExecutorArgs
}
```

### id

-   **Type:** `string`
-   **Default:** `auto-generated`

Optional, unique identifier.

### debug

-   **Type:** `boolean`
-   **Default:** `false`

Optional, debug mode. When enabled, you can use `Redux DevTools` to debug events. See [Debugging Tools](../../guide/use/devTools) for details.

### delimiter

-   **Type:** `string`
-   **Default:** `/`

Optional, event delimiter used to separate multi-level events.

### context

-   **Type:** `any`
-   **Default:** `this`

Optional, execution context for listener functions. Defaults to the `FastEvent` instance.

### ignoreErrors

-   **Type:** `boolean`
-   **Default:** `true`

Optional, whether to ignore errors thrown by listener functions. Defaults to `true`, meaning errors are caught and an error object is returned instead of being thrown.

### meta

-   **Type:** `Meta`
-   **Default:** `undefined`

Optional, global metadata passed to listener functions when an event is emitted.

### onAddListener

-   **Type:** `(type: string[], listener: FastEventListener) => void`
-   **Default:** `undefined`

Optional, callback invoked when a new listener is created.

### onRemoveListener

-   **Type:** `(type: string[], listener: FastEventListener) => void`
-   **Default:** `undefined`

Optional, callback invoked when a listener is removed.

### onClearListeners

-   **Type:** `() => void`
-   **Default:** `undefined`

Optional, callback invoked when all listeners are cleared.

### onListenerError

-   **Type:** `(type: string, error: Error) => void`
-   **Default:** `undefined`

Optional, callback invoked when a listener function throws an error. Used for diagnostics; can be used to print error information.

### onBeforeExecuteListener

-   **Type:** `(message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void`
-   **Default:** `undefined`

Optional, callback invoked before executing a listener. Returning false cancels the execution.

### onAfterExecuteListener

-   **Type:** `(message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void`
-   **Default:** `undefined`

Optional, callback invoked after executing a listener.

### executor

-   **Type:** `FastListenerExecutorArgs`
-   **Default:** `undefined`

Optional, global executor used to customize how listener functions are executed.

## Generic Parameters

```ts
class FastEvent<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
>
```

### Events

Event type definition, extends the `FastEvents` interface.

### Meta

Global event metadata type.

### Context

Execution context type for listener functions.

### Types

Key type of the event types; defaults to the key type of Events.
