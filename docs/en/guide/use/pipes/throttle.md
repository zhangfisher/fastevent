# Throttle

`Throttle` is used to add throttling control to listener function execution.

## Usage

```ts
import { throttle } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // Processing time 200ms
}, {
    pipes: [
        throttle(100) // Throttle time 100ms // [!code ++]
    ]  
}) 
```

## Discarding Messages

Provide a `drop` callback parameter that is called when a message is discarded.

```typescript
// Custom retry configuration
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            throttle(100, { 
                drop: (msg, error) => {// [!code ++]
                   // // [!code ++] 
                }, // [!code ++]
            }),
        ],
    },
);
```