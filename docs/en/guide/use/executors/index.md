# Executors

The essence of event triggering is calling the `emit` method, which calls all registered listener functions and returns the execution results of all listeners.

Under normal circumstances, the `emit` method calls all listener functions in the order they were registered, and then returns the execution results of all listeners.

`FastEvent` provides a flexible executor mechanism that allows developers to configure how multiple listeners are executed, how execution results are handled, and how performance is optimized.

## Built-in Executors

`FastEvent` comes with the following built-in executors:

| Executor                                  | Description                                                                |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `parallel`                                | Default, concurrent execution                                              |
| `race`                                    | Parallel executor, using `Promise.race` for parallel execution             |
| `balance`                                 | Load balancing executor                                                    |
| `first`                                   | Executes the first listener                                                |
| `last`                                    | Executes the last listener                                                 |
| `random`                                  | Randomly selects a listener                                                |
| `series`                                  | Serial executor, executes listeners in sequence and returns the last result |
| `waterfall`                               | Executes listeners in sequence, returns the last result, stops on error    |
| `(listeners,message,args,execute)=>any[]` | Custom executor                                                            |

## Using Executors

- **Specify executor when triggering an event**

Specify an executor when calling the `emit` function to trigger an event, which is only effective for the current event.

```typescript
import { race } from "fastevent/executors"   // [!code ++]

const emitter = new FastEvent();

emitter.emit("event",payload,{
    executor: race()   // [!code ++]
})

```

- **Specify executor globally**

Specify an executor when creating the event emitter, which is effective for all events.

```typescript
import { race } from "fastevent/executors"   // [!code ++]

const emitter = new FastEvent({
    executor: race() // [!code ++]
});

emitter.emit("event",payload)

```

## Custom Executors

In addition to the built-in executors, `FastEvent` also supports custom executors.

You can create custom executors to implement specific execution logic.

```typescript
const customExecutor = (listeners, message, args, execute) => {
    // listeners: array of listeners, each element is a tuple of [listener, maxCount, executedCount]
    // message: event message
    // args: additional parameters
    // execute: function to execute a single listener

    // Example: only execute the first listener
    return [execute(listeners[0][0], message, args)];
};

const emitter = new FastEvent({
    executor: customExecutor,
});
```

### Execution Count Management

Each listener in FastEvent is stored as a tuple: `[listener, maxCount, executedCount]`

-   `listener`: The listener function
-   `maxCount`: Maximum execution count limit (0 means unlimited)
-   `executedCount`: Number of times already executed

**Important note:**

By default, the execution count of listeners is automatically managed, and you don't need to modify it manually.
After each listener execution, `FastEvent` automatically decreases the `executedCount` of all listeners.

However, in some executors, not all listeners need to be executed, such as the `race` and `balance` executors, which only select one listener function to execute from the listener array.
This can cause the execution count of listeners to be inconsistent with expectations.

Therefore, the executor needs to correct this issue to ensure the correctness of the `executedCount` value.

Taking the `random` executor as an example, it randomly selects one listener from the list to execute.

The pseudocode for executing listeners is as follows:

```ts
class FastEvent {
    _executeListeners(listeners, message, args, execute) {
        try {
            executor(listeners, message, args, execute);
        } finally {
            // The execution count of all listeners will be incremented by 1
            // listener = [listener,maxCount,executedCount]
            listeners.forEach((listener) => {
                listener[2]++; //   [!code ++]
            });
        }
    }
}
```

The `random` executor only selects one listener from the list to execute, so it needs to manually correct the execution count of the listeners.

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    // Decrement the execution count of all listeners by 1 to offset the subsequent increment
    listeners.forEach((listener) => listener[2]--); //   [!code ++]
    // Only increment the execution count of the selected listener by 1
    listeners[index][2]++; //   [!code ++]
    return [execute(listeners[index][0], message, args)];
};
```

### Why Use the Execute Function

When creating a custom listener executor, you need to use the `execute` function to execute the listener function.

Taking the `random` executor as an example, the `execute` function is used to execute the listener function.

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    listeners.forEach((listener) => listener[2]--);
    listeners[index][2]++;
    // ❌ Directly executing the listener function: cannot ensure the accuracy of the listener function's context (this) and error handling
    return [listeners[index][0](message, args)];
    // ✅ Use execute to execute the listener function
    return [execute(listeners[index][0], message, args)];
};
```

:::warning Note
You can refer to the code implementation of built-in executors to write your own executor, see [here](https://github.com/zhangfisher/fastevent/tree/master/packages/native/src/executors)
:::