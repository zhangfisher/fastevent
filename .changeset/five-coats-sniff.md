---
'fastevent': patch
---

[feat] 新增加通配符事件类型推断

```ts
import { FastEvent } from 'fastevent';
type Events = {
    'users/*/online': string;
    'users/*/offline': string;
};
const emitter = new FastEvent<Events>();

// 按通配符匹配事件类型
emitter.emit('users/123/online', '123'); //  ✅
emitter.emit('users/123/online', 1); //  ❌
emitter.on('users/123/online', ({ type, payload }) => {
    // type的类型 === 'users/*/online'
    // payload的类型 === string
});
```
