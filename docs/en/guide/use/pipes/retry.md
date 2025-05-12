# Retry

Automatically retries when listener execution fails, supports setting retry count and interval.

## Usage

```typescript 
import { retry } from 'fastevent/pipes'; // [!]code ++
emitter.on(
    'connect',
    async () => {
        await connectToServer();
    },
    {
        pipes: [retry(3)], // Retry up to 3 times on failure
    },
);
```

## Retry Interval

The `interval` parameter is used to specify the retry interval in milliseconds.

```typescript 
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, {
                interval: 1000, // Retry after 1 second // [!code ++]
            }),
        ],
    },
);
```

The `interval` parameter supports passing a function to dynamically calculate the retry interval. The following example implements exponential backoff for retries.

```typescript
// Retry with exponential backoff
emitter.on(
    'upload',
    async (msg) => {
        await uploadFile(msg.payload);
    },
    {
        pipes: [
            retry(4, {                 
                interval: (retryCount) => {
                    return 1000 * Math.pow(2, retryCount) // [!code ++]
                }, 
            }),
        ],
    },
);
``` 

## Discarding Messages

When the retry count exceeds the limit, `retry` will discard the message. You can specify a function through the `drop` parameter to perform some operations when discarding messages.

```typescript
// Custom retry configuration
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, { 
                drop: (msg, error) => console.error('Final failure:', error), // [!code ++]
            }),
        ],
    },
);
```