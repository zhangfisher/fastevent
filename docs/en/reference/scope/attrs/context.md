# context

The global context used to pass to event handler functions (i.e. listener functions).

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
