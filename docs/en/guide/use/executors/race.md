# Race

Returns only the result of the fastest completed listener.
 
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

Since `race` only returns the result of the fastest completed listener, generally, when the fastest listener function completes execution, other listeners should cancel their execution. This is accomplished through the mechanism of aborting listener function execution.

**The `race` executor passes an abortSignal object to all listeners, and listener functions can receive signals and abort execution by calling abortSignal**

```typescript
import { race } from 'fastevent/executors';

const emitter = new FastEvent();

// Directly pass the abort signal to fetch
emitter.on('test', async (message,{abortSignal}) => {
    await fetch('https://www.baidu.com', {
        signal: abortSignal        // [!code ++]
    });
    return 'slow';
});
// Listen for the abort signal, if the abort signal is triggered, exit the listener function
emitter.on('test', async (message,{abortSignal}) => {
    return new Promise<any>((resolve,reject) =>{
        let tmid:any
        abortSignal.addEventListener('abort', () => {
            clearTimeout(tmid);     // Do some cleanup work
            reject(new Error('abort'));
            // resolve()   Can also exit normally
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