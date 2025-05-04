# 错误处理

触发事件时，如果事件处理函数(即监听器)抛出异常，`FastEvent`的错误处理行为如下：

## 默认行为

默认情况下,`FastEvent`忽略错误并返回错误对象。

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

:::warning 提示
错误是以结果形式返回的，数组的顺序与监听器注册的顺序一致。
:::

## 触发错误

可以通过`ignoreErrors`参数控制是否忽略错误。

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
