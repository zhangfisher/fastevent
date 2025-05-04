# events

专门用于获取所有事件类型。

```ts twoslash
import { FastEvent } from "fastevent"
const emitter = new FastEvent<{
    click:{x: number, y: number},
    context: boolean
}>(); 
console.log(emitter.events) // undefined
type Events = typeof emitter.events
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