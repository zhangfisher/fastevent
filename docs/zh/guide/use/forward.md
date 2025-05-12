# 转发订阅

`FastEvent`支持转发订阅，将发布和订阅转发到另外一个`FastEvent`实例。 

## 转发订阅

转发订阅指的是将订阅转发到另外一个`FastEvent`实例。

实现此功能需要使用`Hook API onAddListener`，当调用`on/once/anAny`订阅方法时，会调用该`HOOK`。

该`HOOK`可以通过返回`false`来阻止订阅，也可以直接向其他`FastEvent`实例订阅。
对订阅者而言，订阅者并不知道订阅是否被转发。

为了实现订阅转发，一般需要制定转发订阅的规则，比如：当事件名称以`@/`开头时，将订阅转发到另外一个`FastEvent`实例。


```ts
const otherEmitter = new FastEvent()
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // 订阅转发规则：当事件名称以`@/`开头时，将订阅转发到另外一个`FastEvent`实例
        if (type.startsWith('@/')) {   // [!code ++]
            return otherEmitter.on(type.substring(2), listener, options)// [!code ++]
        }// [!code ++]
    } 
})

// 订阅data事件
emitter.on("@/data", ({ payload }) => {// [!code ++]
    return 1
}) 
emitter.on("@/data", ({ payload }) => {// [!code ++]
    return 2
}) 
// 发布data事件
otherEmitter.emit("data", 1)// [!code ++]

```

`otherEmitter.on`返回的是一个`FastEventSubscriber`对象，可以通过`off`方法取消订阅。在`onAddListener`中可以直接返回给订阅者用于取消。

## 转发发布

也可以在当前`FastEvent`实例直接订阅另外一个`FastEvent`的事件。

实现此功能需要使用`Hook API onBeforeExecuteListener`，该`HOOK`会在执行`emit`时被调用。

```ts
const otherEmitter = new FastEvent()
const emitter = new FastEvent({ 
    onBeforeExecuteListener: (message, args) => {
        // 事件转发规则：当事件名称以`@/`开头时，就发布到其他`FastEvent`实例
        if (message.type.startsWith('@/')) {// [!code ++]
            // 将事件名称从`@/`开始截取
            message.type = message.type.substring(2)// [!code ++]
            return otherEmitter.emit(message, args) // [!code ++]
        }
    }
}) 
otherEmitter.on("data", ({ payload }) => {
    return 1
}) 
otherEmitter.on("data", ({ payload }) => {
    return 2
}) 
const results = emitter.emit("@/data", 1) // [!code ++]
// results = [[1,2]]  ❌错误 //[!code error]
```



- 以上代码中，当`emitter.emit`发布事件时，如果事件名称以`@/开头`，则将消息转发到`otherEmitter`。
- 预期`emit`方法应该返回的是所有订阅者监听器的结果数组：`[1,2]`，但是实际上得到了是`[[1,2]]`。这与预期不相符，为了解决此问题，需要使用`expandable`对`otherEmitter.emit`返回值进行包装，以便对返回的数组结果进行展开，这样可以确保返回结果的一致性。
```ts
import { expandable } from "fastevent"

const otherEmitter = new FastEvent()
const emitter = new FastEvent({ 
    onBeforeExecuteListener: (message, args) => {
        // 事件转发规则：当事件名称以`@/`开头时，就发布到其他`FastEvent`实例
        if (message.type.startsWith('@/')) {
            // 将事件名称从`@/`开始截取
            message.type = message.type.substring(2)
            return expandable(otherEmitter.emit(message, args)) // [!code ++]
        }
    }
}) 
otherEmitter.on("data", ({ payload }) => {
    return 1
}) 
otherEmitter.on("data", ({ payload }) => {
    return 2
}) 
const results = emitter.emit("@/data", 1) // [!code ++]
// results = [1,2]✅    // [!code ++]
```

:::warning 重点
需要使用`expandable`对`otherEmitter.emit`返回值进行包装，以便对返回的数组结果进行展开，这样可以确保返回结果的一致性。
:::

