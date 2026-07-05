# types

Dedicated to obtaining all event types of a `scope`.

```ts twoslash
import { FastEvent } from "fastevent"
const emitter = new FastEvent();
const scope = emitter.scope<{
    click:{x: number, y: number},
    context: boolean
}>('user')
console.log(scope.types) // undefined
type Types = typeof scope.types
type Events = typeof scope.types.events
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
