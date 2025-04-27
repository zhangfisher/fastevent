# 事件作用域

FastEvent 的作用域(Scope)功能允许你创建独立的事件命名空间，实现模块化的事件管理。

## 基本用法

### 创建作用域

```typescript
const emitter = new FastEvent();

// 创建用户相关事件的作用域
const userScope = emitter.scope('user');

// 创建嵌套作用域
const profileScope = userScope.scope('profile');
```

### 作用域事件

在作用域中触发的事件会自动添加作用域前缀：

```typescript
// 在 userScope 中触发 login 事件
// 实际触发的是 'user/login' 事件
userScope.emit('login', { userId: '123' });

// 在 profileScope 中触发 update 事件
// 实际触发的是 'user/profile/update' 事件
profileScope.emit('update', { name: 'Alice' });
```

## 作用域特性

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

### 独立上下文

每个作用域可以有自己的配置和上下文：

```typescript
const userScope = emitter.scope('user', {
    context: { service: 'userService' },
    meta: { domain: 'user' },
});

userScope.on('login', function () {
    console.log(this); // { service: 'userService' }
});
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

## 最佳实践

1. **命名规范**：使用清晰的层级结构（如 `module/action`）
2. **类型继承**：利用 TypeScript 确保作用域事件类型安全
3. **适度嵌套**：避免过深的嵌套结构（建议不超过 3 层）
4. **上下文隔离**：为不同作用域设置独立的上下文
5. **生命周期管理**：及时清理不再使用的作用域

## 作用域 API

### scope(prefix, options)

创建新的作用域

参数：

-   `prefix`: 作用域前缀
-   `options`: 作用域配置
    -   `context`: 监听器的 this 上下文
    -   `meta`: 默认元数据
    -   `delimiter`: 自定义分隔符（默认为'/'）

### offAll()

清除当前作用域的所有监听器

```typescript
userScope.offAll(); // 只清除 user/ 前缀下的事件
```
