# Random

Randomly selects one listener to execute.

```typescript
import { random } from 'fastevent/executors';
const emitter = new FastEvent();

emitter.on('test', () => 'listener1');
emitter.on('test', () => 'listener2');
emitter.on('test', () => 'listener3');

// Each execution will randomly select one listener
const results = emitter.emit('test',1,{
    executor: random()  // [!code ++]
});
console.log(results); // Randomly returns ['listener1'] or ['listener2'] or ['listener3']
```