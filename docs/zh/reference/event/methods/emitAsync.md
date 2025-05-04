# emitAsync() 方法

`emitAsync`是`emit`的异步版本，调用方法与`emit`相同。

`emitAsync`内部是调用`emit`实现的,代码如下：

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

可以看到，`emitAsync`内部是对`emit`的返回值进行了`Promise.allSettled`处理，然后返回一个结果数组。

以下是`emitAsync`与`emit`的简单对比：

-   **同步监听器返回值**

```ts
emitter.on('event', () => 1);
emitter.on('event', () => 2);
emitter.on('event', () => 3);

const syncResults = emitter.emit('event', payload);
const asyncResults = await emitter.emitAsync('event', payload);

// syncResults === [1, 2, 3]
// asyncResults === [1, 2, 3]
```

-   **异步监听器返回值**

```ts
emitter.on('event', async () => 1);
emitter.on('event', async () => 2);
emitter.on('event', async () => 3);

const syncResults = emitter.emit('event', payload);
const asyncResults = await emitter.emitAsync('event', payload);

// syncResults === [Promise, Promise, Promise]
// asyncResults === [1, 2, 3]
```
