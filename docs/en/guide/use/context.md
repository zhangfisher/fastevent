# Context

`Context` refers to the `this` object within event handler functions (`listeners`).

## Default Context

By default, the listener's context is the current `FastEvent` instance.

```typescript
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();
emitter.on('hello', function (this, message) {
    this === emitter; // true      // [!code ++]
});
```

## Specifying Context

Listeners can specify context through the `context` property:

```typescript
import { FastEvent } from 'fastevent';
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context, // Specify context // [!code ++]
});

emitter.on('hello', { context }, function (this, message) {
    this === context; // true
});
```

## Scope Context Specification

Event scopes can also specify context through the `context` property:

```typescript
import { FastEvent } from 'fastevent';
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context,
});
const scopeContext = { a: 1, b: 2 };
const scope = emitter.scope('user', {
    context: scopeContext, // Specify context // [!]code ++
});
scope.on('hello', { context }, function (this, message) {
    this === scopeContext; // true// [!]code ++
});
```

-   Unlike metadata merging strategy, context will override the parent scope's context.