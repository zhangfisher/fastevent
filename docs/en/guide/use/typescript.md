# TypeScript Support

`FastEvent` provides powerful type inference capabilities for seamless TypeScript integration.

## Event Types

`FastEvent` allows defining event types via generics:

```typescript
import { FastEvent } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};

const emitter = new FastEvent<CustomEvents>();

emitter.emit('click', 1); // Type error - payload must be {x:number, y:number}
```

When subscribing to events, type hints are automatically provided:

```typescript
emitter.on('click', (message) => {
    message.type; // 'click'
    message.payload; // { x: number; y: number }
});

// FastEvent still supports arbitrary string event names
emitter.on('xxx', (message) => {
    message.type; // string
    message.payload; // any
});
```

**Global Event Types**  
You can extend the global `FastEvents` interface to apply types across all `FastEvent` instances:

```typescript
declare module 'fastevent' {
    interface FastEvents {
        click: { x: number; y: number };
        mousemove: boolean;
        scroll: number;
        focus: string;
    }
}
```

## Metadata Types

**Automatic Metadata Inference**  
`FastEvent` can automatically infer metadata types:

```typescript
const emitter = new FastEvent({
    meta: {
        x: 1,
        y: 2,
    },
});

emitter.on('click', (message) => {
    // message.meta type: FastEventMeta & { x: number; y: number } & Record<string,any>
});
```

**Explicit Metadata Types**  
You can also define metadata types via generics:

```typescript
type CustomMeta = { x: number; y: number; z?: number };
const emitter = new FastEvent<Record<string, any>, CustomMeta>({
    meta: {
        x: 1,
        y: 2,
    },
});
```

**Global Metadata Types**  
Extend `FastEventMeta` to apply metadata types globally:

```typescript
declare module 'fastevent' {
    interface FastEventMeta {
        x: number;
        y: number;
    }
}
```

## Context Types

By default, the `this` context in listeners points to the `FastEvent` instance:

```typescript
const emitter = new FastEvent();

emitter.on('click', function(message) {
    this === emitter; // true
});
```

Custom context types are automatically inferred when provided:

```typescript
const emitter = new FastEvent({
    context: {
        x: 1,
        y: "hello"
    }
});

emitter.on('click', function(message) {
    // this type: { x: number; y: string }
});
```

:::warning Note
`FastEventScope` has identical type inference and declaration patterns as `FastEvent`.
:::