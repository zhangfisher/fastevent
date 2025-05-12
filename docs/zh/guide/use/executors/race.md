# Race

只返回最快完成的监听器结果。
 
```typescript
import { race } from 'fastevent/executors';

const emitter = new FastEvent();

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'slow';
});

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return 'fast';
});

const results = await emitter.emitAsync('test',1,{
    executor: race()      // [!code ++]
});
console.log(results); // ['fast']
```

由于`race`只返回最快完成的监听器结果，一般情况下，当最快的监听函数执行完成后，其他监听器应该要取消执行，这是通过中止监听器函数执行的机制来完成的。

**`race`执行器会给所有监听器传递一个abortSignal对象，监听器函数可以通过调用abortSignal来接收信号并中止执行**

```typescript
import { race } from 'fastevent/executors';

const emitter = new FastEvent();

// 直接将中止信号传递给fetch
emitter.on('test', async (message,{abortSignal}) => {
    await fetch('https://www.baidu.com', {
        signal: abortSignal        // [!code ++]
    });
    return 'slow';
});
// 监听abort信号，如果abort信号触发，退出监听器函数
emitter.on('test', async (message,{abortSignal}) => {
    return new Promise<any>((resolve,reject) =>{
        let tmid:any
        abortSignal.addEventListener('abort', () => {
            clearTimeout(tmid);     // 做一些清除工作
            reject(new Error('abort'));
            // resolve()   也可能正常退出
        });
        tmid = setTimeout(()=>{
            resolve('slow');
        },5000)
    })        
});


emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return 'fast';
});

const results = await emitter.emitAsync('test',1,{
    executor: race()      // [!code ++]
});
console.log(results); // ['fast']
```