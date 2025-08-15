## 2.2.2

## 2.2.3

### Patch Changes

-   02a2c2d: - **[修复]** 🐛 新监听器执行计数的更新时机

### Patch Changes

-   fa70b58: - **[修复]** 🐛 修复`waitFor`无法等待一个`retain=true`消息的问题

## 2.2.1

### Patch Changes

-   a20b944: - **[特性]** 🚀 `devTools`现在支持显示监听器的`tag`值，帮助更好地定位监听器函数

## 2.2.0

### Minor Changes

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

## 2.1.5

### Patch Changes

-   🚀 **[特性]** `FastEvent.types`新增加导出`listeners`和`anyListener`类型
-   🚀 **[特性]** 新增加`FastEventListener`类型表示通用侦听器类型
-   ✅ **[测试]** 新增加一些类型测试用例

## 2.1.4

### Patch Changes

-   🚀 **[特性]** 新增加`FastEventMessage`类型用示表示通用的事件消息
-   🛠 **[更新]** 原有的`FastEventMessage`类型更名为`TypedFastEventMessage`

## 2.1.3

### Patch Changes

-   b639473: - 🚀 **[特性]** 新增加`types.message`，通过`FastEvent.types.message`得到事件消息类型
-   a0b1fc7: - 🐛 **[修复]** 修复当`emit`消息时，`meta`参数约束不是可选导致提示错误

## 2.1.2

### Patch Changes

-   🚀 **[特性]** `FastEvent`和`FastEventScope`新增加一个`_initOptions`方法供继承时重载进行初始化配置。
-   🐛 **[修复]** 修复`Context`泛型参数为`never`，改进重载`options`时的类型不兼容问题，不再需要`OverrideOptions`类型
-   ✅ **[测试]** 增加了一些类型测试用例

## 2.1.1

### Patch Changes

-   🚀 **[特性]** `queue`新增加一个`onPop`参数，可以在出列回调。可以在此控制如何从消息队列中读取消息

## 2.1.0

### Minor Changes

-   🚀 **[特性]** 新增加`onMessage`配置选项，用于指定默认监听函数。
-   🚀 **[特性]** 优化了`onAddListener`和`onBeforeExecuteListener`运行逻辑，现在可以支持更方便进行转发事件发布和订阅。
-   🚀 **[特性]** 新`series`串行执行器，支持串行执行监听器。
-   🚀 **[特性]** 新增加事件总线功能用于帮助创建模块化事件驱动的应用程。
-   📚 **[文档]** 优化产品文档。
-   ✅ **[测试]** 进一步增加单元测试用例，目前累计`29x`个用例。

## 2.0.2

### Patch Changes

-   🚀 **[特性]** 监听器`Queue`新增加`lifetime`选项，用来为进入队列的消息指定一个最大的生存期，以毫秒为单位。
    当消息在队列中的等待时间超过`lifetime`时消息将被丢弃。
-   🚀 **[特性]** 监听器`Queue`新增加`onDrop`选项，当消息被丢弃时将回调此消息。

## 2.0.1

### Patch Changes

-   🐛 **[修复]** 修复 Pipe 函数没有导出的问题

## 2.0.0

### Major Changes

**全新发布 2.0**

-   🚀 **[特性]** 更加完全的`TypeScript`支持
-   🚀 **[特性]** 支持监听器执行器机制
-   🚀 **[特性]** 支持元数据
-   🚀 **[特性]** 支持事件作用域
-   🚀 **[特性]** 超过 240 个测试用例，98%+代码覆盖率
