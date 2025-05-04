# Error Handling

When triggering events, if an event handler (listener) throws an exception, `FastEvent` handles errors as follows:

## Default Behavior

By default, `FastEvent` ignores errors and returns error objects.

```ts
const emitter = new FastEvent();
const listener1 = () => 1)
const listener2 = () => { throw new Error('error2')
const listener3 = () => { throw new Error('error3')

emitter.on('test', listener1);
emitter.on('test', listener2);
emitter.on('test', listener3);

const results = emitter.emit('test','x');

// results = [1, Error, Error]

```

:::warning Note
Errors are returned as results, and the array order matches the order in which the listeners were registered.
:::

## Throwing Errors

You can control whether to ignore errors using the `ignoreErrors` parameter.

```typescript
const emitter = new FastEvent({
    ignoreErrors: false             // [!code++]
});
const listener1 = () => 1)
const listener2 = () => { throw new Error('error2')
const listener3 = () => { throw new Error('error3')

emitter.on('test', listener1);
emitter.on('test', listener2);
emitter.on('test', listener3);

try{
    emitter.emit('test','x');
}catch(e){
    console.log(e); // [!code++]
}

```