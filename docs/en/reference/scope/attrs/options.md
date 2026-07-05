# Options

Configuration parameters.

```ts
type FastEventScopeOptions<Meta, Context> = {
    // Scope metadata
    meta?: FastEventMeta & Meta
    // Listener execution context
    context?: Context
    // Listener execution strategy
    executor?: FastListenerExecutorArgs
}
```
