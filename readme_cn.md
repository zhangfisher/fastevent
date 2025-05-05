# FastEvent

FastEvent 是一个功能强大的`TypeScript`事件管理库，提供了灵活的事件订阅和发布机制，支持事件通配符、作用域、异步事件等特性。

# 安装

```bash
npm install fastevent
yarn add fastevent
pnpm add fastevent
bun add fastevent
```

# 快速入门

```typescript
import { FastEvent } from 'fastevent';

// 创建事件实例
const events = new FastEvent();

// 订阅事件
events.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
    console.log('事件类型:', message.type);
    console.log('元数据:', message.meta);
});

// 发布事件 - 方式1：参数形式
events.emit('user/login', { id: 1, name: 'Alice' });

// 发布事件 - 方式2：消息对象形式
events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
    meta: { timestamp: Date.now() },
});
```

# 指南

## 事件发射与监听

FastEvent 提供完整的事件发射与订阅 API：

```typescript
const events = new FastEvent();

// 基本事件发射
events.emit('user/login', { id: 1, name: '张三' });

// 带元数据和保留的事件发射
events.emit('config/theme', { dark: true }, true, { timestamp: Date.now() });

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

## 事件保留

为后续订阅者保留最后一次事件值：

```typescript
const events = new FastEvent();

// 发射并保留事件
events.emit('config/theme', { dark: true }, true);

// 后续订阅者立即收到保留的值
events.on('config/theme', (message) => {
    console.log('主题:', message.payload); // 立即输出: { dark: true }
});
```

## 事件通配符

FastEvent 支持两种通配符：

-   `*`: 匹配单层路径
-   `**`: 匹配多层路径

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

FastEvent 提供多种移除监听器的方式：

```typescript
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

注意，作用域与父事件发射器共享相同的监听器表：

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

## 一次性事件

使用 `once` 订阅只触发一次的事件：

```typescript
const events = new FastEvent();

events.once('startup', () => {
    console.log('应用启动');
});

// 等效于：
events.on('startup', handler, { count: 1 });
```

## 事件等待

使用 `waitFor` 等待特定事件发生：

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

## 多级事件和通配符

FastEvent 支持层级化的事件结构和强大的通配符匹配功能。

1. 单层通配符（`*`）：匹配事件路径中的单个层级
2. 多层通配符（`**`）：匹配事件路径中的零个或多个层级,必须在路径模式的末尾使用

```typescript
// 匹配所有用户相关事件
events.on('user/*', (message) => {
    console.log('用户事件:', message.type);
    // 匹配: user/login, user/update 等
});

// 匹配所有 API 事件
events.on('api/**', (message) => {
    console.log('API 事件:', message.type, message.payload);
    // 匹配: api/get, api/users/create, api/posts/123/comments/add 等
});
```

## 全局事件监听

使用 `onAny` 监听所有事件：

```typescript
const events = new FastEvent();

events.onAny((message) => {
    console.log(`事件 ${message.type} 被触发:`, message.payload);
});

// 也可以使用 prepend 选项
events.onAny(handler, { prepend: true });
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
    { userId: '123' }, // 事件数据
    false, // 不保留
    { timestamp: Date.now() }, // 事件特定元数据
);

// 监听器接收合并后的元数据
userScope.on('login', (message) => {
    console.log('元数据:', message.meta);
    // { type: 'user/login', app: 'MyApp', domain: 'user', timestamp: ... }
});
```

## 事件类型定义

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

## 事件钩子

FastEvent 提供了多个钩子函数用于监控和调试事件系统：

```typescript
const events = new FastEvent({
    // 当添加新的监听器时调用
    onAddListener: (path: string[], listener: Function) => {
        console.log('添加了新的监听器:', path.join('/'));
    },

    // 当移除监听器时调用
    onRemoveListener: (path: string[], listener: Function) => {
        console.log('移除了监听器:', path.join('/'));
    },

    // 当清除监听器时调用
    onClearListeners: () => {
        console.log('已清除所有监听器');
    },

    // 当监听器抛出错误时调用
    onListenerError: (type: string, error: Error) => {
        console.error(`事件 ${type} 的监听器发生错误:`, error);
    },
    // 当监听器执行前调用
    onBeforeExecuteListener: (message, returns, listeners) => {
        console.log('事件监听器前执行');
        return true / false;
    },

    // 当监听器执行后调用
    onAfterExecuteListener: (message, returns, listeners) => {
        console.log('事件监听器执行后');
    },
});
```

## 执行器

执行器用于控制触发事件后，如何执行监听器，默认使用 `default` 并行执行器。

```typescript
const events = new FastEvent({
    executor: 'race',
});

events.on('task/start', async () => {
    /* 耗时操作1 */
});
events.on('task/start', async () => {
    /* 耗时操作2 */
});

// 两个监听器会并行执行,返回最快的结果
await events.emitAsync('task/start');
```

内置支持:

| 执行器                  | 描述                                           |
| ----------------------- | ---------------------------------------------- |
| `default`               | 默认执行器，依次执行                           |
| `allSettled`            | 并行执行器，使用 `Promise.allSettled` 并行执行 |
| `race`                  | 并行执行器，使用 `Promise.race` 并行执行       |
| `balance`               | 平均分配执行器                                 |
| `first`                 | 只第一个注册的监听器执行                       |
| `last`                  | 只最后一个注册的监听器执行                     |
| `random`                | 随机执行监听器                                 |
| `IFastListenerExecutor` | 自定义执行器                                   |

## 监听管道

监听管道用于对在订阅事件时对监听函数进行包装，以实现各种常见的高级功能。

```typescript
import { queue } from 'fastevent';
const events = new FastEvent();

// 排队监听器，队列默认大小为10
events.on(
    'data/update',
    (data) => {
        console.log('处理数据:', data);
    },
    {
        pipes: [queue({ size: 10 })],
    },
);
```

内置支持:

| 管道       | 描述                                                     |
| ---------- | -------------------------------------------------------- |
| `queue`    | 队列监听器，用于控制监听器执行顺序，支持优先级和超时控制 |
| `throttle` | 节流监听器，用于控制监听器执行频率                       |
| `debounce` | 防抖监听器，用于控制监听器执行频率                       |
| `timeout`  | 超时监听器，用于控制监听器执行超时                       |
| `retry`    | 重试监听器，用于控制监听器执行失败后重试                 |
| `memorize` | 缓存监听器，用于控制监听器执行结果缓存                   |
