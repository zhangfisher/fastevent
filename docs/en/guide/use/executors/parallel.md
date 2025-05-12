# Parallel

Executes all listeners concurrently, which is the default behavior.

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

- Since `parallel` is the default behavior, it can be omitted.
- Note: If all listeners are synchronous functions, they will not be executed in parallel. This is determined by JavaScript's single-threaded nature.