# types

Returns no value; it is used specifically to obtain all event types.

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
// 

```
