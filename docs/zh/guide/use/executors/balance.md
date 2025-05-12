# Balance

负载均衡执行器，平均分配执行各个事件监听器，尽可能让每个监听器的执行次数相同。

```typescript
import { balance } from 'fastevent/executors';

const emitter = new FastEvent();

emitter.on('test', () => 'handler1');
emitter.on('test', () => 'handler2');
emitter.on('test', () => 'handler3');

// 每个监听器会被大致平均调用
for (let i = 0; i < 9; i++) {
    emitter.emit('test',i,{
        executor: balance()  [!code ++]
    });
}
```

- 上例中指定了`executor: balance()`，表示使用负载均衡执行器，平均分配执行各个事件监听器。因此，以上代码`test`有三个监听器，每次`emit`时只有一个监听器会被执行，`balance`会检查每个监听器函数的执行次数，尽可能平均分配执行。