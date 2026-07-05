# scope

Creates and returns a new event scope instance.

## Method Signature

```ts
scope<
    E extends Record<string, any> = Record<string, any>,
    P extends string = string,
    M extends Record<string, any> = Record<string, any>,
    C = Context
>(prefix: P, options?: FastEventScopeOptions<M, C>)
```

## Parameters

| Parameter | Type                                 | Description           |
| --------- | ------------------------------------ | --------------------- |
| `prefix`  | `string`                             | Scope prefix          |
| `options` | `FastEventScopeOptions<Meta, Context>` | Scope configuration options |
| `options.meta` | `Meta` | Scope metadata |
| `options.context` | `string` | Scope context  |
| `options.executor` | `FastListenerExecutorArgs` | Scope event executor |
 

## Return Value

Returns a `FastEventScope<Events, Meta, Context>` instance with the same interface as FastEvent.
