# FastEvent

🌟 **Top 20 Core Features**

## Event Handling Core Features

🚀 **Flexible Event Triggering Mechanism**

Supports both synchronous (`emit`) and asynchronous (`emitAsync`) event triggering. Asynchronous triggering waits for all `Promise` executions to complete, perfectly handling asynchronous listeners.

🎯 **Powerful Event Routing**

Uses a delimiter (`/`) based event path system, supporting multi-level event organization like `user/profile/update`, making event structures clearer.

🌲 **Tree-structured Listener Storage**

Uses efficient tree structures to store event listeners, optimizing event lookup and triggering performance, supporting large-scale event processing.

🎭 **Wildcard Matching Support**

Provides `*` (single-level) and `**` (multi-level) wildcards for flexible event matching, such as `user/*` or `user/**`.

## Listener Management Features

⚡ **Smart Listener Registration**

Supports three listener modes: regular (`on`), one-time (`once`) and global (`onAny`), meeting different scenario requirements.

🎨 **Rich Listener Options**

Provides options like `count` (execution limit), `prepend` (priority control) for precise listener behavior control.

🔄 **Listener Pipeline Processing**

Supports listener decorator chains through `pipes` option, enabling pre- and post-processing of listeners.

🎪 **Dynamic Listener Control**

Supports `filter` (filter conditions) and `off` (auto-unregister conditions) options for dynamic listener behavior control.

## Advanced Functionality Features

🔢 **Scope Management**

Creates isolated event scopes through `scope` method, supporting namespace isolation and hierarchical management.

💾 **Message Retention Mechanism**

Supports `retain` option to keep the last event message, allowing new subscribers to immediately get the latest state.

⏳ **Event Waiting Mechanism**

Provides `waitFor` method supporting `Promise` style event waiting with timeout configuration.

🎛 **Metadata Extension**

Supports attaching metadata (`meta`) to event messages, providing additional context information.

## Error Handling & Debugging Features

🛡 **Robust Error Handling**

Provides complete error handling mechanism, supporting `ignoreErrors` option and `onListenerError` callback.

🔍 **Debugging Tool Support**

Built-in debug mode (`debug` option), supports development tool integration for easier problem diagnosis.

## Extensibility & Integration Features

🔌 **Extensible Executor**

Supports custom executors (`executor`) to control listener execution methods and order.

🎣 **Rich Lifecycle Hooks**

Provides multiple hook functions like `onAddListener`, `onRemoveListener` for custom behaviors.

## Type System Support

📝 **Complete TypeScript Support**

Provides comprehensive generic type definitions, supporting static checking of event types, payload types and metadata types.

🎯 **Smart Type Inference**

Supports automatic inference of listener parameter types from event definitions, providing complete type safety.

## Performance & Reliability

⚡ **High-performance Design**

Uses efficient tree storage structures and carefully optimized event dispatching mechanism to ensure high performance.

🛡 **Reliable Concurrency Handling**

Ensures reliability in high concurrency scenarios through well-designed event queues and asynchronous processing mechanisms.