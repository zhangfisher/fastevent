# Balance

Load balancing executor, which evenly distributes the execution of event listeners, ensuring that each listener is executed approximately the same number of times.

```typescript
import { balance } from 'fastevent/executors';

const emitter = new FastEvent();

emitter.on('test', () => 'handler1');
emitter.on('test', () => 'handler2');
emitter.on('test', () => 'handler3');

// Each listener will be called roughly the same number of times
for (let i = 0; i < 9; i++) {
    emitter.emit('test',i,{
        executor: balance()  [!code ++]
    });
}
```

- In the example above, `executor: balance()` specifies the use of a load balancing executor, which evenly distributes the execution among event listeners. Therefore, in the code above, `test` has three listeners, but only one listener will be executed for each `emit`. The `balance` executor checks the execution count of each listener function and tries to distribute executions as evenly as possible.