# Metadata

FastEvent provides a flexible metadata mechanism that allows providing additional context data for event listeners to pass to event subscribers.

## Global Metadata

When creating a `FastEvent` instance, you can pass a `meta` option to specify global metadata.

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: {
        source: 'web',
        timeout: 1000,
    },
});
// Metadata received by listeners
emitter.on('x', (message, args) => {
    message.meta; // { source: 'web', timeout: 1000 }
    args.meta; //  undefined
});
```

## Custom Metadata

You can also provide additional metadata when triggering events, which will be merged into the event message's metadata.

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: {
        source: 'web',
        timeout: 1000,
    },
});
// Metadata received by listeners
emitter.on('x', (message, args) => {
    // { source: 'web', timeout: 1000, url: 'https://github.com/zhangfisher/repos' }
    message.meta;
    // { url: 'https://github.com/zhangfisher/repos' }
    args.meta;
});
emitter.emit('x', 1, {
    meta: {
        url: 'https://github.com/zhangfisher/repos',
    },
});
```

## Metadata Types

### Defining Metadata Types

```typescript
import { FastEvent } from 'fastevent';

interface AppMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes, AppMeta>();

// Type checking
emitter.on('user/login', (message, args) => {
    message.meta; // type AppMeta
    args.meta; // undefined
});
```

### Automatic Metadata Type Inference

```typescript
import { FastEvent } from 'fastevent';

interface AppMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes>({
    meta: {
        requestId: 'xxxxxxxx',
        sessionId: '1234',
        userAgent: 'default',
    },
});

// Type checking
emitter.on('user/login', (message, args) => {
    message.meta; // type AppMeta
    args.meta; // undefined
});
```