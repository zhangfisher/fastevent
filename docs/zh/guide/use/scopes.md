# 事件作用域

`FastEvent`的作用域(`Scope`)功能允许你创建独立的事件命名空间，实现模块化的事件管理。

## 快速开始

### 创建作用域

```typescript
const emitter = new FastEvent();
// 创建用户相关事件的作用域
const userScope = emitter.scope('user');
```

-   `emitter.scope('user')`返回一个 `Scope` 对象，该对象继承了 `FastEvent` 的所有方法，因此可以继续调用 `on`、`once`、`off` 等方法。
-   `scope.emit`触发事件时会自动添加作用域前缀：`user/<事件名称>`
-   `scope.on`、`scope.once`监听器函数接收到的`message.type`会自动移除作用域前缀。

### 触发作用域事件

在作用域中触发的事件会自动添加作用域前缀：

```typescript
// 在 userScope 中触发 login 事件
// 实际触发的是 'user/login' 事件
userScope.emit('login', { userId: '123' });
```

-   触发作用域事件时会自动添加作用域前缀，以上代码实际触发的是 `user/login` 事件，因此也可以正常接收 `user/login` 事件。

### 接收作用域事件

```typescript
// 接收 userScope 中的 login 事件
userScope.on('login', (message) => {
    console.log(message.type); // 'login'
});
```

-   `scope` 方法返回一个 `Scope` 对象，该对象继承了 `FastEvent` 的所有方法，因此可以继续调用 `on`、`once`、`off` 等方法。
-   `scope`与`emitter`共享相同的订阅列表，因此也可以在 `emitter` 中接收 `userScope` 中的事件。

```typescript
// 接收 userScope 中的 login 事件
emitter.on('user/login', (message) => {
    console.log(message);
});
```

## 指南

### 创建作用域

事件作用域可以通过 `emitter.scope`或`scope.scope()`方法创建：

```ts
const emitter = new FastEvent();

// 创建用户相关事件的作用域
const userScope = emitter.scope('user');
// 创建嵌套作用域
const profileScope = userScope.scope('profile');
```

### 嵌套作用域

作用域可以嵌套，嵌套的作用域会继承父级的事件类型定义：

```typescript
const emitter = new FastEvent();

// 创建用户相关事件的作用域
const userScope = emitter.scope('user');

// 创建嵌套作用域
const profileScope = userScope.scope('profile');
```

### 元数据

作用域可以设置元数据，并且会与父级的元数据合并.

```ts
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: { root: 1 },
});

const scope = emitter.scope('a/b/c', {
    meta: { c: 1 },
});

scope.on('a/b/c', (message) => {
    message.meta; // { root: number, c: number, scope:string }
});
```

-   `scope.meta`会继承合并父级的`meta`。
-   `scope.meta`会默认注入一个`scope`属性，表示当前作用域的名称。

更多关于元数据的信息请参考[元数据](./metadata.md)

### 上下文

`上下文`指的是事件处理函数（`监听器`）中的`this`对象，作用域会**覆盖**的上下文。

```ts
import { FastEvent } from 'fastevent';
const context = { x: 1, y: 2 };
const emitter = new FastEvent({
    context,
});
const scopeContext = { a: 1, b: 2 };
const scope = emitter.scope('user', {
    context: scopeContext, // 指定上下文 // [!]code ++
});
scope.on('hello', { context }, function (this, message) {
    this === scopeContext; // true// [!]code ++
});
```

关于上下文的信息请参考[上下文](./context.md)

### 执行器

事件作用域也可以配置自己监听器执行器。

```ts
const emitter = new FastEvent();
const scope = emitter.scope('user', {
    executor: 'race',
});
```

关于执行器的信息请参考[执行器](./executors/index)

### 类型安全

作用域继承父级的事件类型定义：

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'user/profile/update': { name: string };
}

const emitter = new FastEvent<AppEvents>();
const userScope = emitter.scope('user');

// 类型检查正常
userScope.emit('login', { userId: '123' }); // ✅

// 类型错误
userScope.emit('login', { userId: 123 }); // ❌
userScope.emit('unknown', {}); // ❌
```

## 使用场景

### 模块化开发

```typescript
// user.module.ts
export function createUserModule(emitter: FastEvent) {
    const scope = emitter.scope('user');

    scope.on('login', handleLogin);
    scope.on('logout', handleLogout);

    return {
        login: (data) => scope.emit('login', data),
        logout: () => scope.emit('logout'),
    };
}
```

### 插件系统

```typescript
// plugin.ts
function installPlugin(emitter: FastEvent) {
    const pluginScope = emitter.scope('plugin/analytics');

    // 插件内部使用自己的事件命名空间
    pluginScope.on('track', trackEvent);

    return {
        track: (event) => pluginScope.emit('track', event),
    };
}
```

### 微前端通信

```typescript
// app1.js
const scope = emitter.scope('app1');
scope.emit('state/update', { data: '...' });

// app2.js
emitter.on('app1/state/update', handleUpdate);
```
