# 事件作用域

事件作用域提供了一种在层次化命名空间中组织和管理事件的方式。它们有助于维护清晰的事件结构并实现强大的事件处理模式。

## 基本作用域

### 创建作用域

通过调用 `scope` 方法创建作用域：

```typescript
const events = new FastEvent();

// 创建用户相关的作用域
const userScope = events.scope('user');

// 这些是等价的：
userScope.on('login', handler);
events.on('user/login', handler);

// 这些也是等价的：
userScope.emit('login', data);
events.emit('user/login', data);
```

### 嵌套作用域

作用域可以嵌套以创建更深层次的层次结构：

```typescript
const userScope = events.scope('user');
const profileScope = userScope.scope('profile');

// 这些是等价的：
profileScope.on('update', handler);
userScope.on('profile/update', handler);
events.on('user/profile/update', handler);

// 事件路径会自动添加前缀
profileScope.emit('update', { name: '张三' });
// 发布: 'user/profile/update'
```

## 作用域上下文

### 设置上下文

作用域可以有自己的执行上下文：

```typescript
const adminScope = events.scope('admin', {
    context: {
        role: 'admin',
        permissions: ['read', 'write'],
    },
});

adminScope.on('action', function () {
    console.log('角色:', this.role);
    console.log('权限:', this.permissions);
});
```

### 上下文继承

嵌套作用域继承并可以扩展父级上下文：

```typescript
const userScope = events.scope('user', {
    context: { type: 'user' },
});

const adminScope = userScope.scope('admin', {
    context: { role: 'admin' },
    // 继承 { type: 'user' }
});
```

## 作用域元数据

### 添加元数据

作用域可以有自己的元数据，这些元数据会与事件元数据合并：

```typescript
const userScope = events.scope('user', {
    meta: {
        domain: 'user',
        access: 'public',
    },
});

userScope.on('login', (message) => {
    console.log(message.meta);
    // 包含: domain, access, 以及任何事件特定元数据
});
```

### 元数据继承

嵌套作用域继承并合并元数据：

```typescript
const apiScope = events.scope('api', {
    meta: { version: 'v1' },
});

const userApiScope = apiScope.scope('users', {
    meta: { resource: 'users' },
});

userApiScope.on('list', (message) => {
    console.log(message.meta);
    // {
    //   type: 'api/users/list',
    //   version: 'v1',
    //   resource: 'users'
    // }
});
```

## 作用域管理

### 清除作用域

移除作用域中的所有监听器：

```typescript
// 清除特定作用域
userScope.clear();

// 清除根作用域
events.clear();
```

### 作用域隔离

作用域与父级发射器共享相同的监听器表，但提供逻辑隔离：

```typescript
const userScope = events.scope('user');
const adminScope = events.scope('admin');

userScope.on('action', () => console.log('用户操作'));
adminScope.on('action', () => console.log('管理员操作'));

userScope.emit('action'); // 输出: "用户操作"
adminScope.emit('action'); // 输出: "管理员操作"
```

## 最佳实践

1. **按领域组织**：

    - 将相关事件分组到公共作用域下
    - 使用有意义的作用域名称
    - 保持作用域层次结构浅层

2. **明智地使用上下文**：

    - 添加相关的执行上下文
    - 避免大型上下文对象
    - 考虑性能影响

3. **管理元数据**：

    - 使用作用域元数据存储公共属性
    - 不要跨作用域重复元数据
    - 保持元数据集中和相关

4. **清理**：

    - 不再需要时清除作用域
    - 适当时移除单个监听器
    - 避免内存泄漏

5. **类型安全**：
    - 为作用域事件定义类型
    - 使用 TypeScript 接口
    - 维护一致的事件结构
