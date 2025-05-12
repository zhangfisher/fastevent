# Debounce

`Debounce` is used to add debounce control to listener function execution. The listener function is only executed when it has not been called again within a specified period after the previous execution.

## Usage

```ts
import { debounce } from 'fastevent/pipes';

emitter.on("test", async (msg) => {
    await delay(200)  // Processing time 200ms
}, {
    pipes: [
        debounce(100) // Debounce time 100ms // [!code ++]
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
            debounce(100, { 
                drop: (msg, error) => {// [!code ++]
                   // // [!code ++] 
                }, // [!code ++]
            }),
        ],
    },
);
```