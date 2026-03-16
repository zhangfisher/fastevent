# 异步事件迭代器

使用`on/onAny`时如果没有指定有效的监听器函数时，返回一个异步事件迭代器`FastEveFastEventIterator`，允许通过`for await (const messages of emitter.on(<事件>))`的形式订阅事件。


