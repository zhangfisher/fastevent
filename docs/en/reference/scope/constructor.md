# Constructor

Creates an event scope.

## Constructor

```ts
constructor(
    public emitter: FastEvent<Events>, 
    public prefix: string, 
    options?: FastEventScopeOptions<Meta, Context>
)

type FastEventScopeOptions<Meta, Context> = {
    meta?: FastEventMeta & Meta
    context?: Context
    executor?: FastListenerExecutorArgs
}
```

### meta

-   **Type:** `Record<string,any>`
-   **Default:** `undefined`

Optional, unique identifier. 
### context

-   **Type:** `any`
-   **Default:** `this`

Optional, the execution context for listener functions. Defaults to the `FastEvent` instance.

### executor

-   **Type:** `FastListenerExecutorArgs`
-   **Default:** `undefined`
 
Specifies the listener executor.

### Types

Used to obtain the event type definition of the event scope.

```ts
interface 
const scope = emitter.scope<Events>("user")
typeof scope.types
```
