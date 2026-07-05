## 2.1.2

### Patch Changes

-   🚀 **[Feature]** `FastEvent` and `FastEventScope` now expose an `_initOptions` method that can be overridden during inheritance to provide initialization configuration.
-   🐛 **[Fix]** Fixed the type incompatibility issue when the `Context` generic parameter is `never` and when overriding `options`. The `OverrideOptions` type is no longer required.
-   ✅ **[Tests]** Added several type test cases.

## 2.1.1

### Patch Changes

- 🚀 **[Feature]** `queue` now accepts an `onPop` parameter, providing a dequeue callback. You can use it to control how messages are read from the message queue.

## 2.1.0

### Minor Changes

- 🚀  **[Feature]** Added an `onMessage` configuration option to specify the default listener function.
- 🚀 **[Feature]** Improved the runtime logic of `onAddListener` and `onBeforeExecuteListener`, making it easier to forward event publishing and subscriptions.
- 🚀 **[Feature]** New `series` serial executor, supporting sequential execution of listeners.
- 🚀 **[Feature]** Added an event bus feature to help build modular event-driven applications.
- 📚 **[Docs]** Improved product documentation.
- ✅ **[Tests]** Further increased unit test cases, now totaling `29x` cases.

## 2.0.2

### Patch Changes

- 🚀 **[Feature]** The listener `Queue` now accepts a `lifetime` option to specify a maximum lifetime (in milliseconds) for messages entering the queue.
    When a message waits in the queue longer than `lifetime`, it will be dropped.
- 🚀 **[Feature]** The listener `Queue` now accepts an `onDrop` option, which is called back when a message is dropped.

## 2.0.1

### Patch Changes

-   🐛 **[Fix]** Fixed the issue where the Pipe function was not exported.

## 2.0.0

### Major Changes

**All-new 2.0 release**

-   🚀 **[Feature]** Fuller `TypeScript` support.
-   🚀 **[Feature]** Support for the listener executor mechanism.
-   🚀 **[Feature]** Support for metadata.
-   🚀 **[Feature]** Support for event scopes.
-   🚀 **[Feature]** Over 240 test cases, 98%+ code coverage.
