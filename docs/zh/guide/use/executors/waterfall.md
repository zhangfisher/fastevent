# Waterfall

瀑布串行执行器是`series`执行器的一个特例。

实现按顺序执行监听器，并将前一个监听器的结果传递给下一个监听器,如果出错就不再执行后续的监听器。

等效于如下代码：

```ts
series(Object.assign({}, options, {
    // 出错时不再执行后续的监听器
    onError: 'abort',
    // 将结果作为payload传给下一个监听器
    onNext: (index: number, previous: any, message: FastEventMessage) => {
        message.payload = previous
    }
}))
```





 