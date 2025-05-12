# Listener Management

## Concept

Listener pipes (`Pipe`) are a powerful mechanism provided by `FastEvent` for controlling and modifying the execution behavior of event listener functions. Through `pipe`, you can add features such as `timeout control`, `throttling`, `debouncing`, `retry`, and more to listener function execution, making event handling more flexible and controllable.

## Basic Usage

When registering event listeners, you can use one or more `pipes` through the `options.pipes` parameter:

```typescript
emitter.on('eventName', listener, {
  pipes: [pipe1(), pipe2(), ...]
})
```

Multiple `pipes` are processed sequentially according to the array order, forming a processing chain. This is equivalent to `pipe3(pipe2(pipe1(listener)))....`

Here is a simple example of using `pipes`, showing how to add timeout and retry functionality to API requests:

```typescript
import { timeout, retry } from 'fastevent/pipes'; // [!code ++]
// Add timeout and retry functionality
emitter.on(
    'api/request',
    async (msg) => {
        // Process API request
    },
    {
        pipes: [
            timeout(5000), // 5 seconds timeout// [!code ++]
            retry(3), // Retry up to 3 times on failure// [!code ++]
        ],
    },
);
```