# Parallel

并且执行所有监听器，这是默认行为。

 ```typescript
const emitter = new FastEvent();

emitter.on('test', () => 1);
emitter.on('test', () => 2);
emitter.on('test', () => 3);
emitter.on('test', () => 4);
emitter.on('test', () => 5);

const results = await emitter.emitAsync('test',1,{
    executor: parallel()  // [!code ++]
});
// [1, 2, 3, 4, 5]
console.log(results); 

```

- 由于`parallel`是默认行为，所以可以省略。
- 注意：如果所有监听器均是同步函数，则不会并行执行。这是js的单线程特性决定的。