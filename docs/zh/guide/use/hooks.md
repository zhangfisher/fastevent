# 事件钩子

FastEvent 提供了丰富的生命周期钩子，允许你在事件处理的关键节点注入自定义逻辑。

## 同步钩子

### onAddBeforeListener

在添加新的事件监听器时触发。

```typescript
const emitter = new FastEvent({
    onAddBeforeListener(type, listener, options) {
        console.log("监听器函数:", listener);
    },
});

emitter.on("event", listener);
```

- 返回`false`可以取消订阅
- 可以在此HOOK中修改监听器或订阅选项。

### onAddAfterListener

在添加新的事件监听器时触发。

```typescript
const emitter = new FastEvent({
    onAddAfterListener(type, node) {
        // type: 事件
        // node: 注册信息
    },
});
```

### onRemoveListener

在移除事件监听器时触发。

```typescript
const emitter = new FastEvent({
    onRemoveListener(node, parts, listener) {
        // node: 注册信息
        // parts: 事件路径数组
        // listener: 被移除的监听器函数
        console.log(`移除监听器: ${parts.join("/")}`);
    },
});
```

### onListenerError

在监听器执行出错时触发。

```typescript
const emitter = new FastEvent({
    onListenerError(error, listener, message, args) {
        // error: 错误对象
        // listener: 监听器函数
        // message: 消息
        // args: 执行监听器的参数
        console.error(`处理事件 ${event} 时出错:`, error);
    },
});
```

### onClearListeners

在调用 `offAll()`清除所有监听器时触发。

```typescript
const emitter = new FastEvent({
    onClearListeners() {
        console.log("所有监听器已被清除");
    },
});
```

### onBeforeExecuteListener

在执行监听器之前触发，可以用于拦截事件执行。

```typescript
const emitter = new FastEvent({
    onBeforeExecuteListener(message, args) {
        // message: 事件消息对象，包含type和payload
        // args: 事件参数
        console.log(`准备执行事件: ${message.type}`);

        // 返回false可以阻止事件执行
        if (message.type.startsWith("restricted/")) {
            return false;
        }
    },
});
```

- `onBeforeExecuteListener`返回`false`代表不执行所有监听器。
- `onBeforeExecuteListener`也可以返回一个`数组`用来返回给`emit`。

```ts
const userEmitter = new FastEvent();

userEmitter.on("login", () => 100);

const emitter = new FastEvent({
    onBeforeExecuteListener(message, args) {
        // 以@开头的事件被转发到userEmitter
        if (message.type.startsWith("@")) {
            return userEmitter.emit(message.type.substring(1), message.payload, args);
        }
    },
});

const reuslts = emitter.emit("@login");
// results === [100]
```

### onAfterExecuteListener

在所有监听器执行完成后触发。

```typescript
const emitter = new FastEvent({
    onAfterExecuteListener(message, results, nodes) {
        // message: 事件消息对象
        // results: 所有监听器的执行结果数组
        // nodes: 执行的监听器节点元数据
        console.log(`事件 ${message.type} 执行完成`);
        console.log("执行结果:", results);
    },
});
```

## 异步钩子

以上同步事件钩子具有相应的异步版本。

- **执行时机：**通过`setTimeout(hook,0)`执行，即在下一个事件循环时执行。
- **注册方法：**

```ts
const emitter = new FastEvent();

type FastEventHooks = {
    AddBeforeListener: AddBeforeListenerHook[];
    AddAfterListener: AddAfterListenerHook[];
    RemoveListener: RemoveListenerHook[];
    ClearListeners: ClearListenersHook[];
    ListenerError: ListenerErrorHook[];
    BeforeExecuteListener: BeforeExecuteListenerHook[];
    AfterExecuteListener: AfterExecuteListenerHook[];
};
// 注册1-N个HOOK
emitter.hooks.AddBeforeListener.push(hook);
emitter.hooks.AddAfterListener.push(hook);
emitter.hooks.RemoveListener.push(hook);
emitter.hooks.ClearListeners.push(hook);
emitter.hooks.ListenerError.push(hook);
emitter.hooks.BeforeExecuteListener.push(hook);
emitter.hooks.AfterExecuteListener.push(hook);
```
