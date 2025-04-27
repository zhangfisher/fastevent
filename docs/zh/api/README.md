# FastEvent API 参考

## 核心类

### FastEvent

-   [构造函数](./FastEvent.md#构造函数)
-   [实例方法](./FastEvent.md#实例方法)
-   [静态方法](./FastEvent.md#静态方法)

### FastEventScope

-   [构造函数](./FastEventScope.md#构造函数)
-   [实例方法](./FastEventScope.md#实例方法)

## 核心 API

### 事件监听

-   [on()](./on.md)
-   [once()](./once.md)
-   [onAny()](./onAny.md)
-   [prependListener()](./prependListener.md)

### 事件触发

-   [emit()](./emit.md)
-   [emitAsync()](./emitAsync.md)
-   [emitWithOptions()](./emitWithOptions.md)

### 事件等待

-   [waitFor()](./waitFor.md)
-   [waitForAll()](./waitForAll.md)

### 监听器管理

-   [off()](./off.md)
-   [offAll()](./offAll.md)
-   [listenerCount()](./listenerCount.md)
-   [getListeners()](./getListeners.md)

### 保留事件

-   [hasRetained()](./hasRetained.md)
-   [getRetained()](./getRetained.md)
-   [clearRetained()](./clearRetained.md)

## 类型定义

-   [FastEventMessage](./types/FastEventMessage.md)
-   [FastEventListenOptions](./types/FastEventListenOptions.md)
-   [FastEventEmitOptions](./types/FastEventEmitOptions.md)
-   [FastEventScopeOptions](./types/FastEventScopeOptions.md)

## 工具方法

-   [createNamespace()](./utils/createNamespace.md)
-   [splitEventPath()](./utils/splitEventPath.md)
-   [matchEventPattern()](./utils/matchEventPattern.md)
