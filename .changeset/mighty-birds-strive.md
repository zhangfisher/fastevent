---
'fastevent': minor
---

-   **[特性]** 🚀 新增加监听器标签功能，允许在注册监听器时提供一个额外的`tag`。

```ts
const emitter = new FastEvent();
emitter.on('test', listener, {
    tag: 'xxx', // [!code ++]
});

emitter.getListener('test');
// [[listener,0,0,"xxx"]]
```

-   **[特性]** 🚀 新增加`getListener`函数，用于获取注册的监听器信息。
