# 事件钩子

FastEvent 提供了丰富的生命周期钩子，允许你在事件处理的关键节点注入自定义逻辑。

## onAddListener

在添加新的事件监听器时触发。

```typescript
const emitter = new FastEvent({
    onAddListener(parts, listener) {
        // parts: 事件路径数组，如['user', 'login']
        // listener: 监听器函数
        console.log(`添加监听器: ${parts.join('/')}`);
        console.log('监听器函数:', listener);
    },
});
```

## onRemoveListener

在移除事件监听器时触发。

```typescript
const emitter = new FastEvent({
    onRemoveListener(parts, listener) {
        // parts: 事件路径数组
        // listener: 被移除的监听器函数
        console.log(`移除监听器: ${parts.join('/')}`);
    },
});
```

## onListenerError

在监听器执行出错时触发。

```typescript
const emitter = new FastEvent({
    onListenerError(event, error) {
        // event: 事件类型
        // error: 错误对象
        console.error(`处理事件 ${event} 时出错:`, error);

        // 返回true表示错误已处理，不再抛出
        return true;
    },
});
```

## onClearListeners

在调用 offAll()清除所有监听器时触发。

```typescript
const emitter = new FastEvent({
    onClearListeners() {
        console.log('所有监听器已被清除');
    },
});
```

## onBeforeExecuteListener

在执行监听器之前触发，可以用于拦截事件执行。

```typescript
const emitter = new FastEvent({
    onBeforeExecuteListener(message, args) {
        // message: 事件消息对象，包含type和payload
        // args: 事件参数
        console.log(`准备执行事件: ${message.type}`);

        // 返回false可以阻止事件执行
        if (message.type.startsWith('restricted/')) {
            return false;
        }
    },
});
```

- `onBeforeExecuteListener`返回`false`代表不执行所有监听器。
- `onBeforeExecuteListener`也可以返回一个`数组`用来返回给`emit`。

```ts
const userEmitter = new FastEvent();

userEmitter.on("login",()=>100)

const emitter = new FastEvent({
    onBeforeExecuteListener(message, args) {
        // 以@开头的事件被转发到userEmitter
        if(message.type.startsWith("@")){
            return userEmitter.emit(message.type.substring(1),message.payload,args)
        }
    },
});

const reuslts = emitter.emit("@login")
// results === [100]

```


## onAfterExecuteListener

在所有监听器执行完成后触发。

```typescript
const emitter = new FastEvent({
    onAfterExecuteListener(message, results, listeners) {
        // message: 事件消息对象
        // results: 所有监听器的执行结果数组
        // listeners: 执行的监听器节点数据
        console.log(`事件 ${message.type} 执行完成`);
        console.log('执行结果:', results);
    },
});
```
