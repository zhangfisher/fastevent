# context

全局上下文，用于传递给事件处理函数（即监听器函数）。

```ts
const emitter = new FastEvent({
    context: {
        x: 100,
    },
});
emitter.context === { x: 100 };
emitter.on('event', function (message) {
    // this==={x:100}
    console.log(this.x);
});
```

-   如果没有指定上下文，则默认为当前`FastEvent`实例。
