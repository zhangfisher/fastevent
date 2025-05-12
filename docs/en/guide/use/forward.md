# Forwarding Subscriptions

`FastEvent` supports forwarding subscriptions, which allows publishing and subscribing to be forwarded to another `FastEvent` instance.

## Forwarding Subscriptions

Forwarding subscriptions refers to forwarding subscriptions to another `FastEvent` instance.

To implement this feature, you need to use the `Hook API onAddListener`, which is called when the `on/once/anAny` subscription methods are called.

This `HOOK` can prevent subscription by returning `false`, or it can directly subscribe to other `FastEvent` instances.
For subscribers, they are unaware of whether the subscription has been forwarded.

To implement subscription forwarding, you generally need to establish rules for forwarding subscriptions, such as: when the event name starts with `@/`, forward the subscription to another `FastEvent` instance.

```ts
const otherEmitter = new FastEvent()
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // Subscription forwarding rule: when the event name starts with `@/`, forward the subscription to another `FastEvent` instance
        if (type.startsWith('@/')) {   // [!code ++]
            return otherEmitter.on(type.substring(2), listener, options)// [!code ++]
        }// [!code ++]
    } 
})
const events: any[] = []
// Subscribe to the data event
emitter.on("@/data", ({ payload }) => {// [!code ++]
    events.push(payload)
}) 
// Publish the data event
otherEmitter.emit("data", 1)// [!code ++]

```

`otherEmitter.on` returns a `FastEventSubscriber` object, which can be used to cancel the subscription using the `off` method. In `onAddListener`, you can directly return it to the subscriber for cancellation.

## Forwarding Publishing

You can also directly subscribe to events from another `FastEvent` instance in the current `FastEvent` instance.

To implement this feature, you need to use the `Hook API onBeforeExecuteListener`, which is called when `emit` is executed.

```ts

        const otherEmitter = new FastEvent()
        const emitter = new FastEvent({ 
            onBeforeExecuteListener: (message, args) => {
                // Event forwarding rule: when the event name starts with `@/`, publish to another `FastEvent` instance
                if (message.type.startsWith('@/')) {// [!code ++]
                    // Extract the event name starting from `@/`
                    message.type = message.type.substring(2)// [!code ++]
                    return otherEmitter.emit(message, args) // [!code ++]
                }
            }
        })
        const events: any[] = []
        otherEmitter.on("data", ({ payload }) => {
            events.push(payload)
        }) 
        const subscriber = emitter.emit("@/data", 1) // [!code ++]
        // You can cancel the subscription just like in the current instance
        subscriber.off()// [!code ++]

```