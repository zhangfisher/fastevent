# First

Executes only the first registered listener.

```typescript
import { first } from 'fastevent/executors';
const emitter = new FastEvent();

emitter.on('test', () => 1);
emitter.on('test', () => 2);
emitter.on('test', () => 3);
emitter.on('test', () => 4);
emitter.on('test', () => 5);

const results = emitter.emit('test',1,{
    executor: first()  // [!code ++]
});
console.log(results); // ['1']
```