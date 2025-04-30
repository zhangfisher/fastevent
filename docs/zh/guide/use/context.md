# 上下文

`上下文`指的是事件处理函数（`监听器`）中的`this`对象/

## 默认上下文

默认情况下，监听器的上下文为当前`FastEvent`实例。

```typescript
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();
emitter.on('hello', function (this, message) {
    this === emitter; // true      // [!code ++]
});
```

## 指定上下文

监听器可以通过`context`属性指定上下文：

```typescript
import { FastEvent } from 'fastevent';
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context, // 指定上下文 // [!code ++]
});

emitter.on('hello', { context }, function (this, message) {
    this === context; // true
});
```

## 作用域指定上下文

事件作用域也可以通过`context`属性指定上下文：

```typescript
import { FastEvent } from 'fastevent';
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context,
});
const scopeContext = { a: 1, b: 2 };
const scope = emitter.scope('user', {
    context: scopeContext, // 指定上下文 // [!]code ++
});
scope.on('hello', { context }, function (this, message) {
    this === scopeContext; // true// [!]code ++
});
```

-   不同于元数据的合并策略，上下文会覆盖上级作用域的上下文。
