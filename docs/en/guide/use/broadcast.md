# Broadcast Events

## Overview

By default, `emit("a")` only triggers listeners **subscribed exactly to `a`**. Even when descendant subscriptions like `on("a/b")` or `on("a/*")` exist, they are not invoked — because event matching stops once it reaches the path endpoint `a`, without descending into the subtree.

**Broadcast** is a **publisher-side** prefix-broadcast capability: in a single `emit`, besides hitting its own path, it simultaneously wakes up **all subscribed descendant listeners** within the endpoint node's subtree (including wildcard subscriptions and concrete descendant paths), and lets you rewrite the event message each descendant receives. Direction is **downward only**.

### vs. Wildcard Subscriptions

- **Wildcard subscription** (`on("a/**")`) is a **subscriber-side** declaration: the subscriber states "I want all descendant events of `a`", but holds a single listener, and the received event `type` is still the original trigger type — it doesn't distinguish which descendant was actually matched.
- **Broadcast** (`emit("a", 1, { broadcast: true })`) is a **publisher-side** behavior: the publisher fans the event out to **all existing descendant subscriptions** of the `a` subtree in one shot, and each descendant listener receives an event whose `type` is rewritten to its own subscription path.

The two don't conflict and can coexist.

:::tip When to use

- A state change needs to notify every subscriber across an entire subtree (component trees, config trees, namespaces)
- A single publish needs different descendant listeners to receive messages matching their own subscription paths
  :::

## Quick Start

The simplest usage — pass `broadcast: true` to `emit`:

```ts
import { FastEvent } from "fastevent";

const emitter = new FastEvent();

emitter.on("a", (message) => {
    console.log(message.type); // 'a'
});
emitter.on("a/b", (message) => {
    console.log(message.type); // 'a/b' (woken by broadcast, type rewritten to its own path)
});
emitter.on("a/c", (message) => {
    console.log(message.type); // 'a/c'
});

// One emit triggers a, a/b and a/c together
emitter.emit("a", 1, { broadcast: true });
```

Or use the `broadcast()` shortcut (equivalent to `emit + { broadcast: true }`):

```ts
emitter.broadcast("a", 1);
```

## Guide

### Default Rewriting

When `broadcast: true`, descendant listeners receive an event message that is **rewritten by default**: `type` is automatically replaced with the descendant's full subscription path; the other fields (`payload`, `meta`) are passed through unchanged.

```ts
emitter.on("a/b", (message) => {
    console.log(message.type, message.payload); // 'a/b' 1
});

emitter.emit("a", 1, { broadcast: true });
```

Normal matches (listeners directly hit by the emit path) are **not rewritten by broadcast** and keep the original message:

```ts
emitter.on("a", (message) => {
    console.log(message.type); // 'a' (original type, unchanged)
});
```

### Custom Rewriting

Pass a function as `broadcast` to rewrite the event message and args for each descendant. The callback return supports three forms:

| Return value                 | Meaning                                               |
| ---------------------------- | ----------------------------------------------------- |
| `[message, args]` tuple      | Override both message and args                        |
| just a `message` object      | Override message only; args keep their original value |
| `null` / `false` (any falsy) | **Skip this descendant** (don't trigger)              |

```ts
emitter.emit("a", 1, {
    broadcast: (type, message, args) => {
        // generate a different payload per descendant
        return [{ ...message, type, payload: `from ${type}` }, args];
    },
});

emitter.on("a/b", (message) => {
    console.log(message.payload); // 'from a/b'
});
```

The callback signature:

```ts
(
    type: string, // the descendant's full subscription path, e.g. 'a/b/b1'
    message: FastEventMessage, // the original event message
    args: FastEventListenerArgs, // the original listener args
    // `this` is bound to the emitter instance
) => [FastEventMessage, FastEventListenerArgs] | FastEventMessage | null;
```

### Skipping Descendants

Return `null` to selectively skip certain descendants — "broadcast only part of the subtree":

```ts
emitter.emit("a", 1, {
    broadcast: (type, message) => {
        if (type.startsWith("a/private")) return null; // skip the private subtree
        return { ...message, type };
    },
});
```

### broadcast() Shortcut

`broadcast(type, payload, callback?, retain?)` is syntactic sugar over `emit`:

```ts
// omit callback — equivalent to emit("a", 1, { broadcast: true })
emitter.broadcast("a", 1);

// custom rewriting
emitter.broadcast("a", 1, (type, message) => ({ ...message, type, payload: 999 }));

// with retain
emitter.broadcast("a", 1, undefined, true);
```

### Wildcard Subscriptions & Broadcast

Broadcast wakes up **all** subscribed descendants in the subtree, including wildcard subscription nodes. A wildcard node receives an event whose `type` is its **literal subscription path**:

```ts
emitter.on("a/*", (message) => {
    console.log(message.type); // 'a/*' (literal path)
});
emitter.on("a/**", (message) => {
    console.log(message.type); // 'a/**'
});

emitter.emit("a", 1, { broadcast: true });
// triggers a/* (type='a/*'), a/** (type='a/**')
```

:::warning Note
`emit("a")` **without broadcast** does not trigger `a/*` or `a/**` — they are only matched by wildcards on `emit("a/something")`. Broadcast fills exactly the gap of "waking the whole subtree with a single emit".
:::

### Execution Order

On broadcast, listeners execute in this order:

1. **Normal matches** first (listeners directly hit by the emit path)
2. **Descendants** in **DFS pre-order** (parent before child)

```ts
const order: string[] = [];
emitter.on("a", () => order.push("a"));
emitter.on("a/b", () => order.push("a/b"));
emitter.on("a/b/c", () => order.push("a/b/c"));
emitter.on("a/d", () => order.push("a/d"));

emitter.emit("a", 1, { broadcast: true });
console.log(order); // ['a', 'a/b', 'a/b/c', 'a/d']
```

The endpoint node itself is triggered exactly once by the normal match and is **not re-triggered by broadcast**.

### With Transform

When combined with `transform`, the rule is "**broadcast first, then transform**": broadcast rewrites `type` for each descendant first, then `transform` converts `payload` based on the rewritten message. In other words, `transform` can observe each descendant's final `type`.

```ts
const emitter = new FastEvent({
    transform: (message) => message.type, // use type as payload
});

emitter.on("a", (payload) => {
    console.log(payload); // 'a'
});
emitter.on("a/b", (payload) => {
    console.log(payload); // 'a/b' (transform saw the broadcast-rewritten type)
});

emitter.emit("a", 1, { broadcast: true });
```

`transform` runs once **per final message** (normal + each descendant).

### With Retain

Events triggered by broadcast are **not** written to the retain table. With `retain: true`, only the original `type`'s message is retained — same behavior as without broadcast:

```ts
emitter.emit("a", 1, { broadcast: true, retain: true });

emitter.retainedMessages.has("a"); // true
emitter.retainedMessages.has("a/b"); // false (broadcast copies are not retained)
```

### Once / Execution Count

A descendant listener triggered by broadcast counts as a **real execution** — `once`, `count` and other execution limits apply as usual:

```ts
let count = 0;
emitter.once("a/b", () => count++);

emitter.emit("a", 1, { broadcast: true }); // triggers once, once unregisters
emitter.emit("a", 1, { broadcast: true }); // broadcast again, a/b no longer fires
console.log(count); // 1
```

### Async

`emitAsync` supports broadcast automatically — no extra work needed:

```ts
await emitter.emitAsync("a", 1, { broadcast: true });
```

### FastEvent specifics: Executors & Hooks

In the main `FastEvent` class, broadcast interoperates with existing features as follows:

- **Executors**: descendant listeners triggered by broadcast execute under the configured executor (`parallel` / `race` / `series` / …), just like normal triggers. See [Executors](./executors/index).
- **Hooks**: `BeforeExecuteListener` / `AfterExecuteListener` fire **exactly once for the original emit**, never re-firing per descendant. `BeforeExecuteListener` returning `false` still aborts the entire emit (including the descendant broadcast). See [Hooks](./hooks).

### LiteEvent Support

`FastLiteEvent` also supports broadcast with an identical API (the `broadcast` option on `emit` and the `broadcast()` shortcut). See [LiteEvent](./liteevent).

:::warning Boundaries & Notes

- Broadcast direction is **downward only** (descendant subtree); it never bubbles up to ancestor-path listeners.
- Broadcast targets **existing descendants subscribed via concrete / wildcard paths**; if the endpoint node has no subtree subscriptions, broadcast has no effect (equivalent to a normal emit).
- Broadcast depth depends on the subscription tree's depth — broadcasting over a deep subtree creates a separate message object per descendant; mind performance.
  :::
