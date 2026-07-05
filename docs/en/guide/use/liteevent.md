# LiteEvent

`FastLiteEvent` is a **lightweight version** of `FastEvent`: while keeping the same core API and type experience, it removes advanced features such as scopes, executors, pipes, hooks, metadata, and context. Its size is about **1/3** of `FastEvent` (about 2.3 KB after gzip).

It is suitable for bundle-size-sensitive scenarios: lightweight browser integration, embedded runtimes, micro-frontend communication, and any project that "just needs reliable event send/receive".

## Import

`FastLiteEvent` is imported via a separate sub-path `fastevent/lite` and does not pollute the main entry:

```ts
import { FastLiteEvent } from 'fastevent/lite';
```

:::tip Zero impact on the main package
`fastevent/lite` is a standalone build artifact; importing it will not pull `FastEvent`'s executor, pipe, and other code into your bundle.
:::

## Quick Start

The core API of `FastLiteEvent` is identical to that of `FastEvent` — listening, emitting, wildcards, and retained events all work out of the box:

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

// Subscribe
emitter.on('user/login', (message) => {
    console.log(message.type); // 'user/login'
    console.log(message.payload); // { id: 1 }
});

// Emit
emitter.emit('user/login', { id: 1 });
```

Wildcards also support `*` (single level) and `**` (multiple levels):

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('user/*', (message) => {
    // Matches user/login and user/logout, but not user/profile/update
});

emitter.on('user/**', (message) => {
    // Matches any level under user
});
```

`retain` retained events are also preserved — new subscribers will immediately receive the last retained message:

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.emit('status', 'online', true); // retain=true

emitter.on('status', (message) => {
    console.log(message.payload); // Immediately outputs 'online'
});
```

## Differences from FastEvent

`FastLiteEvent` intentionally removes the following advanced features in exchange for a smaller size and a simpler execution path:

| Category | `FastEvent` | `FastLiteEvent` |
| --- | --- | --- |
| **Scopes** (`scope` / `FastEventScope`) | ✅ | ❌ |
| **Executors** (parallel / race / series / waterfall …) | ✅ | ❌ (synchronous sequential execution only) |
| **Listener pipes** (queue / throttle / debounce / retry …) | ✅ | ❌ |
| **Event hooks** (`onAddBeforeListener`, etc.) | ✅ | ❌ |
| **Metadata** (`meta`) | ✅ | ❌ |
| **Context** (`context` / listener `this`) | ✅ Configurable | ❌ (`this` is always the instance itself) |
| **Async iteration** (`for await` / `Iterator`) | ✅ | ❌ |
| **`waitFor`** waiting for events | ✅ | ❌ |
| **`abortSignal`** aborting execution | ✅ | ❌ |
| **Debugging** (`debug`) | ✅ | ❌ |
| **`filter` / `off` on subscribe** | ✅ | ❌ |
| **Listener priority `prepend`** | ✅ | ❌ |
| Basic send/receive (`on` / `once` / `onAny` / `emit` / `emitAsync`) | ✅ | ✅ |
| Wildcards `*` / `**` | ✅ | ✅ |
| `retain` retained events | ✅ | ✅ |
| `count` / `tag` / `flags` | ✅ | ✅ |
| `ignoreErrors` swallowing errors | ✅ | ✅ |
| `transform` message transformation | ✅ | ✅ |
| `off` / `offAll` / `clear` / `getListeners` / `clearRetainMessages` | ✅ | ✅ |

### Messages have no `meta`

The message type of `FastLiteEvent`, `FastLiteMessage`, removes the `meta` field from `FastEventMessage` and keeps only `type` and `payload`:

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('x', (message) => {
    type Keys = keyof typeof message;
    //   ^? 'type' | 'payload'
});
```

### The listener's `this`

`FastEvent` supports customizing `this` inside a listener via the `context` option; `FastLiteEvent` removes that capability, and `this` inside a listener always points to the emitter instance itself:

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('x', function (message) {
    console.log(this === emitter); // true
});

emitter.emit('x');
```

### Type marker

The type marker field is `__FastLiteEvent__` (corresponding to `FastEvent`'s `__FastEvent__`):

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();
console.log(emitter.__FastLiteEvent__); // true
```

## When to Choose FastLiteEvent

:::tip FastLiteEvent is recommended for the following scenarios
- Browser-side projects that are strictly sensitive to bundle size
- Only need basic event subscribe/emit, without scopes, executors, or pipes
- Resource-constrained runtimes such as embedded systems, IoT, and mini-programs
- Use as an internal event bus for micro-frontends, SDKs, or component libraries
:::

:::warning Use FastEvent directly when you need any of the following
- Need event scopes (`scope`) for namespace isolation
- Need executors (parallel / serial / race / load balancing)
- Need listener pipes (throttle, debounce, retry, queue)
- Need metadata (`meta`), context (`context`), event hooks
- Need advanced capabilities such as `waitFor`, async iteration, `abortSignal`
:::

## Interoperability with FastEvent

The types of `FastLiteEvent` and `FastEvent` are derived from the same source, and the listener function signatures are bidirectionally compatible — the same listener function can be attached to both `FastEvent` and `FastLiteEvent`:

```ts twoslash
import { FastEvent } from 'fastevent';
import { FastLiteEvent } from 'fastevent/lite';

// The same listener, signature-compatible with both
const shared = (message: { type: string; payload: any }) => {
    console.log(message.type, message.payload);
};

const evt = new FastEvent();
const lite = new FastLiteEvent();

evt.on('x', shared);
lite.on('x', shared);
```

This allows listener logic to be freely reused in a hybrid architecture where the core uses `FastEvent` and edge modules use `FastLiteEvent`.
