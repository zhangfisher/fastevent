# Random

随机选择一个监听器执行。

```typescript
import { random } from 'fastevent/executors';
const emitter = new FastEvent();

emitter.on('test', () => '监听器1');
emitter.on('test', () => '监听器2');
emitter.on('test', () => '监听器3');

// 每次执行会随机选择一个监听器
const results = emitter.emit('test',1,{
    executor: random()  // [!code ++]
});
console.log(results); // 随机返回 ['监听器1'] 或 ['监听器2'] 或 ['监听器3']
```
