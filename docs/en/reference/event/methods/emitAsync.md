# emitAsync

`emitAsync` is the asynchronous version of `emit`, and is called the same way as `emit`.

`emitAsync` is implemented internally by calling `emit`. The code is as follows:

```ts
class FastEvent {
async emitAsync(){
    const results = await Promise.allSettled(this.emit.apply(this, arguments as any))
    return results.map((result) => {
        if (result.status === 'fulfilled') {
            return result.value
        } else {
            return result.reason
        }
    })
}
```

As you can see, `emitAsync` internally applies `Promise.allSettled` to the return value of `emit` and then returns an array of results.

The following is a brief comparison between `emitAsync` and `emit`:

-   **Synchronous listener return values**

```ts
emitter.on('event', () => 1);
emitter.on('event', () => 2);
emitter.on('event', () => 3);

const syncResults = emitter.emit('event', payload);
const asyncResults = await emitter.emitAsync('event', payload);

// syncResults === [1, 2, 3]
// asyncResults === [1, 2, 3]
```

-   **Asynchronous listener return values**

```ts
emitter.on('event', async () => 1);
emitter.on('event', async () => 2);
emitter.on('event', async () => 3);

const syncResults = emitter.emit('event', payload);
const asyncResults = await emitter.emitAsync('event', payload);

// syncResults === [Promise, Promise, Promise]
// asyncResults === [1, 2, 3]
```
