## 2.4.0

### Minor Changes

-   a97fd87: [feat] 全新升级类型系统
    [feat] 新增加通过异步迭代器消费事件

## 2.2.2

## 2.3.7

### Patch Changes

-   61da93b: 优化 removeItem 和 isPathMatched

## 2.3.6

### Patch Changes

-   4581eab: 修改含通配符时的事件类型匹配

## 2.3.5

### Patch Changes

-   7c1fb68: FastEventScope 增加 listeners 返回监听器注册信息

## 2.3.4

### Patch Changes

-   d3647f5: fix: scope event types

## 2.3.3

### Patch Changes

-   0cd8993: 优化事件名称包含通配符时的类型推断

## 2.3.2

### Patch Changes

-   c85c3d4: 优化 scope 执行 transform 逻辑

## 2.3.1

### Patch Changes

-   888f72e: feat: 支持为`scope`单独指定`transform`

## 2.3.0

### Minor Changes

-   ae7522f: add transform message for listener

## 2.2.12

### Patch Changes

-   a7a2735: feat: upgrade ScopeEvents

## 2.2.11

### Patch Changes

-   2beec06: feat: ScopeEvents 类型支持通配符

## 2.2.10

### Patch Changes

-   fa4a8d2: [feat] 新增加通配符事件类型推断

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

## 2.2.9

### Patch Changes

-   4624b5b: 修复 emitAsync 方法的类型错误

## 2.2.8

### Patch Changes

-   32ef8ce: 修复 emit 方法时的泛型事件参数推断

## 2.2.7

### Patch Changes

-   5e1db3a: scope 的 emit/emitAsync 新增加 retain 参数签名

## 2.2.6

### Patch Changes

-   a7e87d7: event scope.emit & emitAsync 新增加 retain
-   e370ae2: feat: add flags listener options

## 2.2.5

### Patch Changes

-   cd223c7: feat: add utils exports

## 2.2.4

### Patch Changes

-   35cb2da: 新导出 isPathMatched 函数

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
