# FastEvent

[WebSite](https://zhangfisher.github.io/fastevent/)

`FastEvent` is a well-designed, powerful, type-safe, and thoroughly tested event emitter that provides robust event subscription and publishing mechanisms, suitable for both `nodejs/browser` environments.

# Installation

```bash
npm install fastevent
yarn add fastevent
pnpm add fastevent
bun add fastevent
```

# Features

## Core Event System

- 🚀 **Flexible Triggering** — Sync `emit` and async `emitAsync` (awaits all Promises), perfect for async listeners.
- 🎯 **Hierarchical Event Paths** — `/`-delimited routing (e.g. `user/profile/update`) keeps event structure clear and organized.
- 🌲 **Tree-based Storage** — An efficient tree structure for fast listener lookup and dispatch at scale.
- 🎭 **Wildcard Matching** — `*` (single level) and `**` (multi level) for flexible subscriptions like `user/*` or `user/**`.
- 📡 **Broadcast** — Publish-side prefix broadcast wakes all descendant subscribers in a single `emit`.

## Listener Management

- ⚡ **Smart Registration** — `on`, `once`, and `onAny` (global) listeners for any scenario.
- 🎨 **Rich Options** — `count`, `prepend`, `filter`, `context`, and more for fine-grained behavior control.
- 🔄 **Listener Pipes** — Wrap listeners with `queue`, `throttle`, `debounce`, `timeout`, `retry`, and `memorize`.
- 🧹 **Automatic Cleanup** — Native `using` keyword for scope-based subscriber teardown.
- ↩️ **Return Value Collection** — Listener return values gathered by `emit`/`emitAsync` in registration order.

## Advanced Capabilities

- 🎪 **Scopes** — Namespace isolation that shares the parent listener table, with automatic prefix handling.
- 💾 **Retained Messages** — New subscribers instantly receive the last event value via `retain`.
- ⏳ **waitFor** — Promise-based event waiting with configurable timeout.
- 🔂 **Async Iterators** — Consume events naturally via `for await...of`.
- 🛑 **Abortable Execution** — Cooperative cancellation of async listeners with `AbortSignal`.
- 🎛 **Metadata (meta)** — Attach extra context at the global, scope, or event level.
- 🔁 **Message Transform** — Customize the message shape each listener receives.
- 🧭 **Listener Context** — Configure the `this` binding at instance, scope, or listener level.

## Execution Control

- 🔌 **Executors** — Control how listeners run: `parallel`, `race`, `series`, `waterfall`, `first`, `last`, `random`, `balance`, or a custom function.
- 🎣 **Lifecycle Hooks** — Tap into `onAddBeforeListener`, `onBeforeExecuteListener`, `onAfterExecuteListener`, and more.
- 🛡 **Robust Error Handling** — Errors captured as results by default; opt in to throwing with `ignoreErrors` or customize via `onListenerError`.
- 🔗 **Event Forwarding** — Elegantly forward publish/subscribe across `FastEvent` instances.

## Ecosystem

- 🚌 **Event Bus** — `FastEventBus` + `FastEventBusNode` for event-driven modular apps, supporting broadcast, publish/subscribe, and point-to-point messaging.
- 🪶 **LiteEvent** — A ~1/3 size variant (~2.3 KB gzipped) with the same core API and type experience, for bundle-size-sensitive scenarios.
- 🧬 **Class Inheritance** — Extend `FastEvent` / `FastEventScope` to customize options and behavior.
- 🔍 **DevTools Viewer** — Built-in `fastevent-viewer` component for visual debugging.

## Type Safety & Quality

- 📝 **Full TypeScript Support** — Complete generics for events, payloads, and metadata.
- 🎯 **Smart Type Inference** — Listener parameter types auto-derived from event definitions.
- 🧪 **Thoroughly Tested** — 320+ test cases with 99%+ coverage.

# License

MIT

For more detailed documentation, see [WebSite](https://zhangfisher.github.io/fastevent/)
