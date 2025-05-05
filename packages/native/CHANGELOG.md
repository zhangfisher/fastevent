# fastevent

## 2.0.2

### Patch Changes

-   523633f: - [🚀feat] 监听器`Queue`新增加`lifetime`选项，用来为进入队列的消息指定一个最大的生存期，以毫秒为单位。
    当消息在队列中的等待时间超过`lifetime`时消息将被丢弃。
    -   [🚀feat] 监听器`Queue`新增加`onDrop`选项，当消息被丢弃时将回调此消息。

## 2.0.1

### Patch Changes

-   9b0a21e: 修复 Pipe 函数没有导出的问题

## 2.0.0

### Major Changes

-   7f1711c: 全新发布 2.0

    -   更加完全的`TypeScript`支持
    -   支持监听器执行器机制
    -   支持元数据
    -   支持事件作用域
    -   超过 240 个测试用例，98%+代码覆盖率
