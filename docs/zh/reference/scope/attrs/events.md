# events

专门用于获取`scope`所有事件类型。

```ts twoslash
import { FastEvent } from "fastevent"
const emitter = new FastEvent();
const scope = emitter.scope<{
    click:{x: number, y: number},
    context: boolean
}>('user')
console.log(scope.events) // undefined
type Events = typeof scope.events
//   ^?
// 
// 
// 
// 
//
//
//
//
//
//
```