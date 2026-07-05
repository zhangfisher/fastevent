# off

Unsubscribe listeners for the specified event.

## Method Signature

```ts
// Unsubscribe a specific listener
off(listener: FastEventListener<any, any, any>): void
// Unsubscribe all matching listeners starting with the given string
off(type: string, listener: FastEventListener<any, any, any>): void
// Unsubscribe all listeners whose type matches
off(type: Types, listener: FastEventListener<any, any, any>): void
// Unsubscribe all listeners starting with the given string
off(type: string): void
off(type: Types): void
```
 

## Return Value

None
