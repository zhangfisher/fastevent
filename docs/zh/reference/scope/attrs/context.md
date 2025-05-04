# context

全局上下文，用于传递给事件处理函数（即监听器函数）。

```ts twoslash
import { FastEvent } from "fastevent"
const emitter = new FastEvent();
const scope = emitter.scope('user',{
    context : { x: 100 }
})

scope.on('event', function (message) {
    type This = typeof this
    //   ^?
});
// 
// 
// 
// 
// 
```
