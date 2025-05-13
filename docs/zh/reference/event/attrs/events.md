# types

不返回任何值，专门用于获取所有事件类型。

```ts twoslash
import { FastEvent } from "fastevent"
const emitter = new FastEvent<{
    click:{x: number, y: number},
    context: boolean
}>(); 
type Types = typeof emitter.types
type Events = typeof emitter.types.events
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