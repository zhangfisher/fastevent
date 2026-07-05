# context

Global context, passed to event handler functions (i.e., listener functions).

```ts
const emitter = new FastEvent({
    context: {
        x: 100,
    },
});
emitter.context === { x: 100 };
emitter.on('event', function (message) {
    // this === {x:100}
    console.log(this.x);
});
```

-   If no context is specified, it defaults to the current `FastEvent` instance.
