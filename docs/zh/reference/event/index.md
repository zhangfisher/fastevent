# FastEvent 类

事件发射器类，提供事件发布/订阅功能。

## 描述

FastEvent 是一个高性能的事件发射器实现，支持：

-   事件订阅(on/once)
-   事件发布(emit/emitAsync)
-   通配符匹配
-   事件作用域(scope)
-   保留事件(retain)
-   异步事件处理

## 模板参数

```ts
class FastEvent<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
>
```

-   `Events`: 事件类型定义，继承自 FastEvents 接口
-   `Meta`: 事件元数据类型，默认为任意键值对对象
-   `Context`: 监听器执行上下文类型
-   `Types`: 事件类型的键名类型，默认为 Events 的键名类型

## 构造函数

```ts
constructor(options?: FastEventOptions<Meta, Context>)
```

### 参数

| 参数    | 类型                            | 描述               |
| ------- | ------------------------------- | ------------------ |
| options | FastEventOptions<Meta, Context> | 事件发射器配置选项 |

### 默认配置

```ts
{
    debug: false, // 是否启用调试模式
    id: 随机字符串, // 实例唯一标识符
    delimiter: '/', // 事件名称分隔符
    context: null, // 监听器执行上下文
    ignoreErrors: true, // 是否忽略监听器执行错误
    meta: undefined // 元数据
}
```

## 属性

### listeners

```ts
public listeners: FastListeners
```

事件监听器树结构，存储所有注册的事件监听器

### listenerCount

```ts
listenerCount: number = 0;
```

当前注册的监听器总数

### retainedMessages

```ts
retainedMessages: Map<string, any>;
```

保留的事件消息映射，用于新订阅者

## 示例

```ts
// 创建事件发射器实例
const emitter = new FastEvent({
    delimiter: '.', // 使用.作为分隔符
    context: this, // 设置监听器执行上下文
    meta: { app: 'MyApp' }, // 设置元数据
});

// 订阅事件
emitter.on('user.login', (data) => {
    console.log('用户登录:', data);
});

// 发布事件
emitter.emit('user.login', { userId: 123 });
```
