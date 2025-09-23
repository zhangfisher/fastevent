# 快速入门

本节将帮助你快速上手`FastEvent`，了解其核心功能和基本用法。

## 事件发布与订阅

`FastEvent`提供完整的事件发射与订阅功能，其 `API` 设计参考了`eventemitter2`。

```typescript
import { FastEvent } from 'fastevent';
const events = new FastEvent();

// 基本事件发布
const results = events.emit('user/login', { id: 1 });

// 异步事件发射
const results = await events.emitAsync('data/process', { items: [...] });

// 事件订阅
events.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
});

// 一次性监听器
events.once('startup', () => console.log('应用已启动'));

// 带选项的监听
events.on('data/update', handler, {
    count: 3,       // 最大触发次数
    prepend: true,  // 添加到队列开头
    filter: (msg) => msg.payload.important // 只处理重要更新
});

// 全局监听器
events.onAny((message) => {
    console.log('事件发生:', message.type);
});
```

## 事件消息

监听器函数接收一个`Message`对象，该对象包含以下属性：

```ts
events.on('user/login', (message) => {
    // {
    //     type: 'user/login', // 事件名称
    //     payload: { id: 1 }, // 事件数据
    //     meta: {...}         // 事件元数据
    // }
});
```

## 保留事件

保留最后一次事件数据，后续订阅者可以在订阅时马上接收到事件值：

```typescript
const events = new FastEvent();

// 发布并保留事件
events.emit('config/theme', { dark: true }, true);
// 等效于
events.emit('config/theme', { dark: true }, { retain: true });

// 后续订阅者立即收到保留的值
events.on('config/theme', (message) => {
    console.log('主题:', message.payload); // 立即输出: { dark: true }
});
```

## 层级事件发布

`FastEvent`支持发布与阅层级事件。

-   默认事件层级分隔符为`/`，可以通过`options.delimiter`修改分隔符：
-   在订阅事件时支持两种通配符，`*`匹配单层路径，`**`匹配多层路径(仅用于事件名称的末尾)

```typescript
const events = new FastEvent();

// 匹配 user/*/login
events.on('user/*/login', (message) => {
    console.log('任何用户类型的登录:', message.payload);
});

// 匹配 user 下的所有事件
events.on('user/**', (message) => {
    console.log('所有用户相关事件:', message.payload);
});

// 触发事件
events.emit('user/admin/login', { id: 1 }); // 两个处理器都会被调用
events.emit('user/admin/profile/update', { name: 'New' }); // 只有 ** 处理器会被调用
```

## 移除监听器

`FastEvent`提供多种移除监听器的方式：

```typescript
//
// 返回订阅器对象，通过它移除监听器，推荐使用这种方式
const subscriber = events.on('user/login', handler);
subscriber.off();

// 移除特定监听器
events.off(listener);
// 移除某个事件的所有监听器
events.off('user/login');
// 移除某个事件的特定监听器
events.off('user/login', listener);
// 使用通配符模式移除监听器
events.off('user/*');
// 移除所有监听器
events.offAll();
// 移除某个前缀下的所有监听器
events.offAll('user');
```

## 事件作用域

作用域允许你在特定的命名空间下处理事件。

**注意**，作用域与父事件发射器共享相同的监听器表：

```typescript
const events = new FastEvent();

// 创建用户相关的作用域
const userScope = events.scope('user');

// 以下两种方式等效：
userScope.on('login', handler);
events.on('user/login', handler);

// 以下两种方式也等效：
userScope.emit('login', data);
events.emit('user/login', data);

// 清除作用域中的所有监听器
userScope.offAll(); // 等效于 events.offAll('user')
```

## 等待事件触发

使用`waitFor`等待特定事件发生，并支持超时。

```typescript
const events = new FastEvent();

async function waitForLogin() {
    try {
        // 等待登录事件，超时时间 5 秒
        const userData = await events.waitFor('user/login', 5000);
        console.log('用户已登录:', userData);
    } catch (error) {
        console.log('登录等待超时');
    }
}

waitForLogin();
// 稍后触发登录事件
events.emit('user/login', { id: 1, name: 'Alice' });
```

## 事件钩子

`FastEvent`提供了多个钩子函数，用于在事件发射器生命周期的不同阶段进行操作。

```typescript
const otherEvents = new FastEvent();
const events = new FastEvent({
    // 当添加新的监听器时调用
    onAddListener: (type, listener, options) => {
        console.log('添加了新的监听器:', type);
        // 返回 false 可以阻止监听器添加
        return false;
        // 可以直接返回一个FastEventSubscriber
        // 例如：将以 `@` 开头事件，则转移发到使用其他FastEvent
        if (type.startsWith('@')) {
            return otherEvents.on(type, listener, options);
        }
    },
    // 当移除监听器时调用
    onRemoveListener: (type, listener) => {
        console.log('移除了监听器:', type);
    },
    // 当清除监听器时调用
    onClearListeners: () => {
        console.log('已清除所有监听器');
    },
    // 当监听器抛出错误时调用
    onListenerError: (error, listener, message, args) => {
        console.error(`事件 ${message.type} 的监听器发生错误:`, error);
    },
    // 当监听器执行前调用
    onBeforeExecuteListener: (message, args) => {
        console.log('事件监听器前执行');
        // 返回 false 可以阻止监听器执行
        return false;

        // 将事件转发给其他FastEvent
        // 例如：将以 `@` 开头事件，则转发到使用其他FastEvent
        if (type.startsWith('@')) {
            return otherEvents.emit(message.type);
        }
    },
    // 当监听器执行后调用
    onAfterExecuteListener: (message, returns, listeners) => {
        console.log('事件监听器执行后');
        // 可以在在此拦截对返回值进行修改
    },
});
```

## 执行器

默认情况下，触发事件时会并且执行所有监听器。

`FastEvent`提供强大的监听器执行机制，允许开发者控制如何执行监听器。

```typescript
import { race } from 'fastevent/executors';// [!code ++]
const events = new FastEvent({
    executor: race(),// [!code ++]
});

events.on('task/start', async () => {
    /* 耗时操作1 */
});
events.on('task/start', async () => {
    /* 耗时操作2 */
});

// 两个监听器会并行执行,返回最快的结果
await events.emitAsync('task/start');

// 也可以在事件发射器上单独设置执行器：
await events.emitAsync('task/start', 100, {
    executor: race() // [!code ++]
});
```

**内置支持**:

| 执行器                                    | 描述                                         |
| ----------------------------------------- | -------------------------------------------- |
| `parallel`                                | 默认，并发执行                               |
| `race`                                    | 并行执行器，使用 `Promise.race` 并行执行     |
| `balance`                                 | 平均分配执行器                               |
| `first`                                   | 执行第一个监听器                             |
| `last`                                    | 执行最后一个监听器                           |
| `random`                                  | 随机选择监听器                               |
| `series`                                  | 串行执行器，依次执行监听器并返回最后一个结果 |
| `waterfall`                               | 依次执行监听器并返回最后一个结果,出错时中断  |
| `(listeners,message,args,execute)=>any[]` | 自定义执行器                                 |

:::warning 提示
执行器需要从`fastevent/executors`中导入。

如：`import { race } from 'fastevent/executors`。
:::

## 监听管道

监听管道用于对在订阅事件时对监听函数进行包装，以实现各种常见的高级功能。

```typescript
import { queue } from 'fastevent/pipes';// [!code ++]
const events = new FastEvent();

//排队处理消息
events.on(
    'data/update',
    (data) => {
        console.log('处理数据:', data);
    },
    {
        pipes: [queue({ size: 10 })],// [!code ++]
    },
);
```

允许支持使用多个监听管道,如`pipes:[queue(),retry(),timeout()]`，相当于`timeout(retry(queue(listener)))`。

**内置支持:**

| 管道       | 描述                                           |
| ---------- | ---------------------------------------------- |
| `queue`    | 队列监听管道，排队处理消息，支持优先级和超时控制 |
| `throttle` | 节流监听管道                                     |
| `debounce` | 防抖监听管道                                 |
| `timeout`  | 超时监听管道                                     |
| `retry`    | 重试监听管道，用于控制监听器执行失败后重试       |
| `memorize` | 缓存监听管道，对监听器执行结果缓存               | 
| `(listener: FastEventListener) => FastEventListener` | 自定义监听管道              |

:::warning 提示
监听管道需要从`fastevent/pipes`中导入。

如：`import { queue } from 'fastevent/pipes`。
:::

## 转发发布与订阅

`FastEvent`可以非常优雅的方式将发布和订阅转发到另外一个`FastEvent`实例。

```ts
import { expandable } from "fastevent"
const otherEmitter = new FastEvent();
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // 订阅转发规则：当事件名称以`@/`开头时，将订阅转发到另外一个`FastEvent`实例
        if (type.startsWith('@/')) {
            return otherEmitter.on(type.substring(2), listener, options);
        }
    },
    onBeforeExecuteListener: (message, args) => {
        // 事件转发规则：当事件名称以`@/`开头时，就发布到其他`FastEvent`实例
        if (message.type.startsWith('@/')) {
            message.type = message.type.substring(2);
            return expandable(otherEmitter.emit(message, args)); // [!code ++]
        }
    },
});
const events: any[] = [];
otherEmitter.on('data', ({ payload }) => {
    events.push(payload);
});
// 订阅otherEmitter的data事件
const subscriber = emitter.on('@/data', ({ payload }) => {
    expect(payload).toBe(1);
    events.push(payload);
});
subscriber.off()
// 将data事件发布到otherEmitter
emitter.emit('@/data', 1);
```

## 元数据(Meta)

元数据是一种为事件提供额外上下文信息的机制。

你可以在不同层级设置元数据：全局、作用域级别或事件特定级别。

```typescript
const events = new FastEvent({
    meta: {
        version: '1.0',
        environment: 'production',
    },
});

events.on('user/login', (message) => {
    console.log('事件数据:', message.payload);
    console.log('元数据:', message.meta); // 包含 type、version 和 environment
});

// 使用作用域级元数据
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});
// 发布事件时添加特定元数据
userScope.emit(
    'login',
    { userId: '123' },
    {
        meta: { timestamp: Date.now() }, // 事件特定元数据
    },
);

// 监听器接收合并后的元数据
userScope.on('login', (message) => {
    console.log('元数据:', message.meta);
});
```

## 事件类型定义

`FastEvent`具备完整的`TypeScript`类型支持。

```typescript
// 定义具有不同载荷类型的事件
interface ComplexEvents {
    'data/number': number;
    'data/string': string;
    'data/object': { value: any };
}

const events = new FastEvent<ComplexEvents>();

// TypeScript 确保每个事件的类型安全
events.on('data/number', (message) => {
    const sum = message.payload + 1; // payload 的类型为 number
});

// 所有的事件发送都会进行类型检查
events.emit('data/number', 42);
events.emit('data/string', 'hello');
events.emit('data/object', { value: true });
```

## 单元测试

`FastEvent`经过充分的单元测试，累计单元测试用例超过`300+`，测试覆盖率`99%+`。
