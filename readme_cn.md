# FastEvent

FastEvent 是一个功能强大的`TypeScript`事件管理库，提供了灵活的事件订阅和发布机制，支持事件通配符、作用域、异步事件等特性。

对比`EventEmitter2`，`FastEvent`具有以下优势：

-   `FastEvent`的性能比`EventEmitter2`高 `1~2`倍左右。
-   `FastEvent`包大小为 `6.xkb`，而`EventEmitter2`为 `43.4kb`。
-   `FastEvent`拥有更丰富的功能。

# 安装

使用 npm 安装:

```bash
npm install fastevent
```

或使用 yarn:

```bash
yarn add fastevent
```

# 快速入门

## 基本使用

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

## 事件触发

FastEvent 提供了多种灵活的事件触发方式：

### 基本事件触发

```typescript
const events = new FastEvent();

// 方式1：参数形式
events.emit('user/login', { id: 1, name: 'Alice' });

// 方式2：消息对象形式
events.emit({
    type: 'user/login',
    payload: { id: 1, name: 'Alice' },
    meta: { timestamp: Date.now() },
});
```

### 保留事件

设置 `retain=true` 可以将事件保留供新订阅者使用：

```typescript
// 触发并保留事件
events.emit('config/update', { theme: 'dark' }, true);

// 后续订阅者会立即收到保留的事件
events.on('config/update', (message) => {
    console.log('配置:', message.payload); // { theme: 'dark' }
});
```

### 事件元数据

元数据可以在不同层级设置并自动合并：

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' }, // 全局元数据
});

// 事件特定元数据
events.emit('order/create', { id: '123' }, false, {
    timestamp: Date.now(),
});

// 监听器接收合并后的元数据：
// { type: 'order/create', app: 'MyApp', timestamp: ... }
```

### 返回值

`emit()` 返回所有监听器的执行结果数组：

```typescript
events.on('calculate', () => 1);
events.on('calculate', () => 2);

const results = events.emit('calculate');
console.log(results); // [1, 2]
```

### 类型安全的事件触发

使用 TypeScript 时，事件数据会进行类型检查：

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
}

const events = new FastEvent<MyEvents>();

// 有效 - 数据符合类型定义
events.emit('user/login', { id: 1, name: 'Alice' });

// 错误 - 数据类型不匹配
events.emit('user/login', { id: '1' }); // TypeScript 报错
```

## 事件消息格式

FastEvent 使用标准化的消息格式处理所有事件：

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // 事件类型
    payload: P; // 事件数据
    meta: M; // 事件元数据
};
```

事件监听器始终接收这个消息对象，提供了一致的方式来访问事件数据和元数据。

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

## 事件作用域

作用域允许你在特定的命名空间下处理事件。注意，作用域与父事件发射器共享相同的监听器表：

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

## 监听器选项

订阅事件时可以指定额外的选项：

```typescript
interface FastEventListenOptions {
    // 监听器被调用的次数（0表示无限次，1表示一次）
    count?: number;
    // 将监听器添加到监听器数组的开头
    prepend?: boolean;
}

// 示例：监听前3次事件
events.on('data', handler, { count: 3 });

// 示例：确保处理器在其他监听器之前被调用
events.on('important', handler, { prepend: true });
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

## 异步事件

支持异步事件处理：

```typescript
const events = new FastEvent();

events.on('data/fetch', async () => {
    const response = await fetch('https://api.example.com/data');
    return await response.json();
});

// 异步发布事件返回所有结果/错误的数组
const results = await events.emitAsync('data/fetch');
console.log('所有处理器的结果:', results);
```

## 监听器返回值

`emit` 和 `emitAsync` 方法都会返回所有事件监听器的执行结果：

```typescript
const events = new FastEvent();

// 同步监听器的返回值
events.on('calculate', () => 1);
events.on('calculate', () => 2);
events.on('calculate', () => 3);

// 获取返回值数组
const results = events.emit('calculate');
console.log('结果:', results); // [1, 2, 3]

// 异步监听器
events.on('process', async () => '结果 1');
events.on('process', async () => '结果 2');

// 获取异步结果/错误数组
const asyncResults = await events.emitAsync('process');
console.log('异步结果:', asyncResults); // ['结果 1', '结果 2']
```

对于异步事件，`emitAsync` 会等待所有监听器完成执行，并返回一个数组，包含所有监听器的解析值，如果监听器执行失败则包含错误对象。

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

## 保留事件数据

保留最后一次事件数据，新的订阅者会立即收到该数据：

```typescript
const events = new FastEvent();

// 发布事件并保留
events.emit('config/update', { theme: 'dark' }, true);

// 之后的订阅者会立即收到保留的数据
events.on('config/update', (message) => {
    console.log('配置:', message.payload); // 立即输出: 配置: { theme: 'dark' }
});
```

## 多级事件和通配符

FastEvent 支持层级化的事件结构和强大的通配符匹配功能。

### 事件路径结构

事件可以使用路径分隔符（默认为'/'）组织成层级结构：

```typescript
const events = new FastEvent();

// 基本的多级事件
events.on('user/profile/update', handler);
events.on('user/settings/theme/change', handler);

// 自定义分隔符
const customEvents = new FastEvent({
    delimiter: '.',
});
customEvents.on('user.profile.update', handler);
```

### 通配符模式

FastEvent 支持两种类型的通配符：

1. 单层通配符（`*`）：
    - 匹配事件路径中的单个层级
    - 可以在路径的任何层级使用

```typescript
// 匹配任意用户类型
events.on('user/*/login', (message) => {
    console.log('用户类型:', message.type.split('/')[1]);
    // 匹配: user/admin/login, user/guest/login 等
});

// 匹配任意操作
events.on('api/users/*/action/*', (message) => {
    const [, , userId, , action] = message.type.split('/');
    console.log(`用户 ${userId} 执行了 ${action} 操作`);
    // 匹配: api/users/123/action/update, api/users/456/action/delete 等
});
```

2. 多层通配符（`**`）：
    - 匹配事件路径中的零个或多个层级
    - 必须在路径模式的末尾使用

```typescript
// 匹配所有用户相关事件
events.on('user/**', (message) => {
    console.log('用户事件:', message.type);
    // 匹配: user/login, user/profile/update, user/settings/theme/change 等
});

// 匹配所有 API 事件
events.on('api/**', (message) => {
    console.log('API 事件:', message.type, message.payload);
    // 匹配: api/get, api/users/create, api/posts/123/comments/add 等
});
```

### 高级通配符用法

```typescript
const events = new FastEvent();

// 使用单层通配符
events.on('service/*/user/update', (message) => {
    // 匹配如下模式：
    // service/auth/user/update
    // service/admin/user/update
    const parts = message.type.split('/');
    const serviceType = parts[1];
    console.log(`${serviceType} 服务用户更新:`, message.payload);
});

// 在末尾使用多层通配符
events.on('service/auth/**', (message) => {
    // 匹配如下模式：
    // service/auth/user/update
    // service/auth/user/profile/update
    // service/auth/settings/theme/change
    console.log('认证服务事件:', message.type, message.payload);
});

// 使用 TypeScript 的类型安全事件
interface ApiEvents {
    'api/users/profile': { userId: string; data: any };
    'api/posts/comments': { postId: string; commentId: string; text: string };
}

const typedEvents = new FastEvent<ApiEvents>();

// 精确匹配的类型安全
typedEvents.on('api/users/profile', (message) => {
    const { userId, data } = message.payload; // 正确的类型推断
});

// 通配符监听器仍然可用但会失去部分类型安全
typedEvents.on('api/*', (message) => {
    // message.payload 类型在这里是 any
    console.log('API 事件:', message.type);
});

// 通配符事件监控
events.on('**', (message) => {
    console.log('事件拦截:', {
        类型: message.type,
        时间戳: new Date(),
        数据: message.payload,
    });
});

// 使用示例
events.emit('service/auth/user/profile/update', { name: '张三' });
events.emit('api/users/123/profile', { userId: '123', data: { age: 30 } });
```

### 重要说明

1. 通配符限制：

    - `**` 通配符必须在路径末尾使用
    - `*` 可以在路径中多次使用
    - 通配符不能在单个段中组合（例如，'a/\*\*/b' 是无效的）

2. 性能考虑：

    - 不使用通配符的具体模式匹配速度最快
    - `*` 通配符比 `**` 更高效
    - 过度使用 `**` 通配符可能影响性能

3. 最佳实践：
    - 尽可能使用具体的模式
    - 限制 `**` 通配符的使用
    - 仔细规划事件层级结构
    - 使用 TypeScript 接口确保类型安全

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

元数据是一种为事件提供额外上下文信息的机制。你可以在不同层级设置元数据：全局、作用域级别或事件特定级别。

### 全局元数据

在创建 FastEvent 实例时设置全局元数据：

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
```

### 作用域元数据

创建作用域时可以指定元数据，它会与全局元数据合并：

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

userScope.on('login', (message) => {
    console.log('元数据:', message.meta);
    // { type: 'user/login', app: 'MyApp', domain: 'user' }
});

// 嵌套作用域会递归合并元数据
const profileScope = userScope.scope('profile', {
    meta: { section: 'profile' },
});

profileScope.on('update', (message) => {
    console.log('元数据:', message.meta);
    // { type: 'user/profile/update', app: 'MyApp', domain: 'user', section: 'profile' }
});
```

### 事件特定元数据

在发布事件时可以传递额外的元数据，它会与更高级别的元数据合并：

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

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

### 元数据合并规则

1. 优先级(从高到低):

    - 事件特定元数据
    - 作用域元数据(从内层到外层)
    - 全局元数据
    - 系统元数据(type 总是会被添加)

2. 合并行为:

    - 浅合并(仅顶层属性)
    - 后定义的属性会覆盖先定义的
    - 不会深度合并嵌套对象

3. 特殊情况:
    - `type` 总是保留为完整事件路径
    - `undefined` 值会从结果中移除该属性
    - 数组会被替换而不是连接

## 错误处理

FastEvent 提供了错误处理机制：

```typescript
const events = new FastEvent({
    ignoreErrors: true, // 默认为 true，不会抛出错误
    onListenerError: (type, error) => {
        console.error(`处理事件 ${type} 时发生错误:`, error);
    },
});

events.on('process', () => {
    throw new Error('处理失败');
});

// 不会抛出错误，而是触发 onListenerError
events.emit('process');
```

## 泛型参数

FastEvent 支持三个泛型类型参数来实现精确的类型控制：

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Types extends keyof Events = keyof Events
>
```

1. `Events`：定义事件类型和对应的载荷（payload）类型的映射
2. `Meta`：定义可以附加到事件的元数据类型
3. `Types`：所有事件类型的联合类型（通常从 Events 中推导）

### 基本类型安全

```typescript
// 定义事件类型
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

// 创建带类型的事件发射器
const events = new FastEvent<MyEvents>();

// 事件名称和数据类型检查
events.on('user/login', (message) => {
    // message.payload 的类型为 { id: number; name: string }
    const { id, name } = message.payload;
});

// 错误：错误的事件名称
events.emit('wrong/event', {});

// 错误：错误的数据类型
events.emit('user/login', { wrong: 'type' });
```

### 自定义元数据类型

```typescript
// 定义元数据结构
interface MyMeta {
    timestamp: number;
    source: string;
}

// 创建带自定义元数据的事件发射器
const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    // message.meta 的类型为 MyMeta
    const { timestamp, source } = message.meta;
    console.log(`来自 ${source} 的登录，时间：${timestamp}`);
});

// 发送带类型化元数据的事件
events.emit('user/login', { id: 1, name: 'Alice' }, false, { timestamp: Date.now(), source: 'web' });
```

### 高级类型用法

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

events.on('data/string', (message) => {
    const upper = message.payload.toUpperCase(); // payload 的类型为 string
});

events.on('data/object', (message) => {
    const value = message.payload.value; // payload 的类型为 { value: any }
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

    // 当监听器执行后调用（仅在调试模式下）
    onExecuteListener: (message, returns, listeners) => {
        console.log('事件执行完成:', {
            类型: message.type,
            数据: message.payload,
            返回值: returns,
            监听器数量: listeners.length,
        });
    },
});
```

这些钩子函数为事件系统的运行提供了有价值的洞察：

1. `onAddListener`: 监控监听器注册

    - 在添加新的事件监听器时调用
    - 接收事件路径数组和监听器函数
    - 用于跟踪事件订阅情况

2. `onRemoveListener`: 跟踪监听器移除

    - 在移除监听器时调用
    - 帮助监控事件取消订阅的模式
    - 接收与 onAddListener 相同的参数

3. `onClearListeners`: 通知批量监听器移除

    - 在调用 offAll() 时触发
    - 用于监控清理操作
    - 不接收任何参数

4. `onListenerError`: 错误处理钩子

    - 当监听器抛出错误时调用
    - 接收事件类型和错误对象
    - 实现集中式错误处理
    - 仅在 ignoreErrors 为 true 时调用

5. `onExecuteListener`: 执行监控（调试模式）
    - 仅在设置 debug: true 时激活
    - 提供详细的执行信息
    - 包含消息、返回值和监听器列表
    - 用于调试和性能监控

使用示例：

```typescript
const events = new FastEvent({
    debug: true, // 启用调试模式以激活 onExecuteListener
    onAddListener: (path, listener) => {
        console.log(`添加了 ${path.join('/')} 的监听器`);
        // 跟踪监听器数量或模式
    },
    onListenerError: (type, error) => {
        console.error(`${type} 中发生错误:`, error);
        // 记录到监控系统
    },
    onExecuteListener: (message, returns, listeners) => {
        console.log(`事件 ${message.type} 执行完成:`, {
            执行时间: Date.now(),
            监听器数量: listeners.length,
            执行结果: returns,
        });
        // 监控事件执行模式
    },
});

// 触发钩子的示例事件
events.on('user/login', () => {
    // 将调用 onAddListener
});

events.on('data/process', () => {
    throw new Error('处理失败');
    // 将调用 onListenerError
});

events.emit('user/login', { id: 1 });
// 将调用 onExecuteListener（如果 debug: true）

events.offAll();
// 将调用 onClearListeners
```

# 参数

FastEvent 构造函数接受以下配置选项：

````typescript
interface FastEventOptions<Meta = Record<string, any>, Context = any> {
    /**
     * 事件发射器的唯一标识符
     * @default 随机生成的字符串
     */
    id?: string;

    /**
     * 是否启用调试模式
     * @default false
     * @remarks 当为true时，可以在Redux DevTools中查看事件
     */
    debug?: boolean;

    /**
     * 事件路径的分隔符
     * @default '/'
     * @example
     * ```ts
     * new FastEvent({ delimiter: '.' }); // 使用点作为分隔符
     * ```
     */
    delimiter?: string;

    /**
     * 事件处理器的默认执行上下文
     * @default null
     */
    context?: Context;

    /**
     * 是否忽略监听器错误
     * @default true
     */
    ignoreErrors?: boolean;

    /**
     * 附加到所有事件的全局元数据
     * @default undefined
     */
    meta?: Meta;

    /**
     * 添加监听器时的回调
     * @param path - 路径分段数组
     * @param listener - 监听器函数
     */
    onAddListener?: (path: string[], listener: Function) => void;

    /**
     * 移除监听器时的回调
     * @param path - 路径分段数组
     * @param listener - 监听器函数
     */
    onRemoveListener?: (path: string[], listener: Function) => void;

    /**
     * 清除所有监听器时的回调
     */
    onClearListeners?: () => void;

    /**
     * 监听器抛出错误时的回调
     * @param type - 事件类型
     * @param error - 错误对象
     */
    onListenerError?: (type: string, error: Error) => void;

    /**
     * 监听器执行后的回调（仅在调试模式）
     * @param message - 事件消息
     * @param returns - 监听器返回值数组
     * @param listeners - 已执行的监听器数组
     */
    onExecuteListener?: (message: FastEventMessage, returns: any[], listeners: (FastEventListener<any, any, any> | [FastEventListener<any, any>, number])[]) => void;
}

// 调试模式使用示例
import 'fastevent/devtools';
const emitter = new FastEvent({
    debug: true, // 启用调试模式以在Redux DevTools中查看事件
});
````

# 性能

![](./bench.png)
