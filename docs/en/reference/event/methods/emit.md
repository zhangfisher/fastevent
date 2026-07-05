# emit

Synchronously trigger the specified event.

## Method Signature

Provides a total of `8` overload signatures, where `T` is the event type, `Events` is the events object, and `Meta` is the metadata object.

### Type-safe Basic Usage

This form can infer the event type from the event generic parameters provided when constructing `FastEvent`.

```ts
//
emit<R = any, T extends Types = Types>(
    type: T,
    payload?: Events[T],
    options?: FastEventListenerArgs<Meta>
): R[]
// Specify retain
emit<R = any, T extends Types = Types>(
    type: T,
    payload?: Events[T],
    retain?: boolean
): R[]

```

-   **Example**

```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent<{
    click: number;
    focus: string;
    blur: boolean;
}>();

emitter.emit('click', 100);
//            ^|
//
//
//
//
```

### String Event Type

Directly specify any string event type.

```ts
emit<R = any, T extends string = string>(
    type: T,
    payload?: T extends Types ? Events[Types] : any,
    retain?: boolean
): R[]
emit<R = any, T extends string = string>(
    type: T,
    payload?: T extends Types ? Events[Types] : any,
    options?: FastEventListenerArgs<Meta>
): R[]
```

### Type-safe Message Object Parameter

```ts
emit<R = any, T extends string = string>(
    message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>,
    retain?: boolean
): R[]
emit<R = any, T extends string = string>(
    message: FastEventEmitMessage<{ [K in T]: K extends Types ? Events[K] : any }, Meta>,
    options?: FastEventListenerArgs<Meta>
): R[]
```

### Message Object Parameter

```ts
emit<R = any>(
    message: FastEventEmitMessage<Events, Meta>,
    retain?: boolean
): R[]
emit<R = any>(
    message: FastEventEmitMessage<Events, Meta>,
    options?: FastEventListenerArgs<Meta>
): R[]
```

## Parameters

| Parameter             | Type                       | Description                                                                                            |
| --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `type`                | `T`                        | The event type to trigger; can be automatically inferred                                               |
| `payload`             | `Events[T]`                | Event payload data                                                                                     |
| `options`             | `FastEventListenerArgs`    | Whether to retain the event data                                                                       |
| `options.retain`      | `boolean`                  | Whether to retain the message; if `true`, the last message is retained. See [Retain Messages](../../../guide/use/retain-messages.md) |
| `options.meta`        | `Record<string, any>`      | Event metadata, passed to the listeners                                                                |
| `options.abortSignal` | `AbortSignal`              | Passed to the listener function. See [Abort Listeners](../../../guide/use/abort.md)                    |
| `options.executor`    | `FastListenerExecutorArgs` | Controls listener execution behavior. See [Executors](../../../guide/use/executors/index)              |

## Return Value

The `emit` function returns the return values of all matching listener functions.

```ts
const emitter = new FastEvent<{ click: number }>();

emit.on('click', () => 1)
emit.on('click', () => {throw new Error('custom'))
emit.on('click', async () =>2 )
emit.on('click', async () => {throw new Error('custom'))

const results = emit('click', 100);
// [1,Error,Promise,Promise]

```

-   You can specify a generic parameter `R` to indicate the return type of the listener functions; `R[]` is the return type of the listener functions, defaulting to `any[]`.
