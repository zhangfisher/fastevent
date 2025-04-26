# FastEventScope 类

`FastEventScope` 类提供作用域化的事件管理功能，继承自 `FastEvent` 类。

## 构造函数

```typescript
constructor(parent: FastEvent, name: string, options?: ScopeOptions)
```

### 参数

-   `parent`: 父级 FastEvent 实例
-   `name`: 作用域名称
-   `options`: 作用域配置选项

## 方法

继承自 FastEvent 的所有方法，并添加以下特定方法：

### scope()

创建嵌套作用域：

```typescript
scope<Name extends string, Events extends Record<string, any> = Record<string, any>>(
    name: Name,
    options?: ScopeOptions
): FastEventScope<Events>
```

#### 参数

-   `name`: 嵌套作用域名称
-   `options`: 作用域配置选项

#### 返回值

新的 FastEventScope 实例

### clear()

清除当前作用域中的所有监听器：

```typescript
clear(): void
```

## 属性

### name

作用域名称：

```typescript
readonly name: string
```

### parent

父级 FastEvent 实例：

```typescript
readonly parent: FastEvent
```

### fullPath

完整作用域路径：

```typescript
readonly fullPath: string
```

## 类型参数

```typescript
class FastEventScope<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```

## 使用示例

### 基本用法

```typescript
const events = new FastEvent();
const userScope = events.scope('user');

userScope.on('login', (message) => {
    console.log('用户登录:', message.payload);
});

// 等效于
events.on('user/login', handler);
```

### 嵌套作用域

```typescript
const events = new FastEvent();
const apiScope = events.scope('api');
const userScope = apiScope.scope('users');

userScope.on('get', (message) => {
    console.log('获取用户:', message.payload);
});

// 完整路径: 'api/users/get'
```

### 带类型安全

```typescript
interface UserEvents {
    login: { id: number; name: string };
    logout: { id: number };
}

const events = new FastEvent();
const userScope = events.scope<'user', UserEvents>('user');

userScope.emit('login', { id: 1, name: '张三' }); // ✅ 正确
userScope.emit('login', { id: '1' }); // ❌ 类型错误
```

### 作用域配置

```typescript
const events = new FastEvent();
const adminScope = events.scope('admin', {
    meta: { role: 'admin' },
    context: { permissions: ['read', 'write'] },
});

adminScope.on('action', function () {
    console.log('权限:', this.permissions);
});
```

## 最佳实践

1. **命名规范**：

    - 使用有意义的名称
    - 保持一致性
    - 避免特殊字符

2. **作用域深度**：

    - 限制嵌套层级
    - 通常不超过 3 层
    - 考虑可维护性

3. **类型安全**：

    - 为每个作用域定义事件类型
    - 使用泛型参数
    - 文档化事件结构

4. **性能考虑**：
    - 监控监听器数量
    - 及时清理不再使用的作用域
    - 避免过度嵌套
