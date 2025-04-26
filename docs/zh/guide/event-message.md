# 事件消息格式

FastEvent 使用标准化的事件消息格式。理解这个格式对于有效使用该库非常重要。

## 消息结构

### 基本格式

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // 事件类型/路径
    payload: P; // 事件数据
    meta: M; // 元数据
};
```

### 类型参数

-   `T`: 事件类型（通常是字符串）
-   `P`: 负载类型
-   `M`: 元数据类型

## 发布事件

### 方式 1: 参数形式

```typescript
const events = new FastEvent();

// 基本发布
events.emit('user/login', { id: 1, name: '张三' });

// 带保留标志和元数据
events.emit(
    'user/login', // 事件类型
    { id: 1, name: '张三' }, // 负载
    true, // 保留标志
    { timestamp: Date.now() }, // 元数据
);
```

### 方式 2: 消息对象形式

```typescript
const events = new FastEvent();

events.emit({
    type: 'user/login',
    payload: { id: 1, name: '张三' },
    meta: { timestamp: Date.now() },
});
```

## 接收事件

### 事件处理器

事件处理器接收完整的消息对象：

```typescript
events.on('user/login', (message) => {
    console.log('事件类型:', message.type);
    console.log('用户数据:', message.payload);
    console.log('元数据:', message.meta);
});
```

### 类型安全

使用 TypeScript 接口确保类型安全：

```typescript
interface MyEvents {
    'user/login': {
        id: number;
        name: string;
    };
    'user/logout': {
        id: number;
    };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();

events.on('user/login', (message) => {
    // message.payload 类型为 { id: number; name: string }
    const { id, name } = message.payload;

    // message.meta 类型为 MyMeta
    const { timestamp, source } = message.meta;
});
```

## 事件路径

### 路径格式

事件路径使用分隔符（默认为'/'）创建层次结构：

```typescript
// 默认分隔符 '/'
events.emit('user/profile/update', data);

// 自定义分隔符
const events = new FastEvent({ delimiter: '.' });
events.emit('user.profile.update', data);
```

### 路径组件

事件路径通常遵循层次结构：

```typescript
// 格式: 领域/实体/操作
events.emit('user/profile/update', data);
events.emit('system/config/change', data);
events.emit('api/users/create', data);
```

## 元数据处理

### 系统元数据

FastEvent 自动添加一些系统元数据：

```typescript
events.on('user/login', (message) => {
    console.log(message.meta);
    // 总是包含:
    // - type: 完整事件路径
    // 其他系统元数据可能在将来版本中添加
});
```

### 自定义元数据

在不同层级添加自定义元数据：

```typescript
// 全局元数据（构造函数）
const events = new FastEvent({
    meta: { app: 'MyApp', version: '1.0' },
});

// 作用域元数据
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

// 事件元数据
userScope.emit('login', data, false, {
    timestamp: Date.now(),
});
```

## 最佳实践

1. **事件命名**：

    - 使用清晰、描述性的路径
    - 遵循一致的命名模式
    - 考虑路径层次结构

2. **负载设计**：

    - 保持负载专注
    - 仅包含必要数据
    - 考虑序列化

3. **元数据使用**：

    - 用于横切关注点
    - 保持元数据轻量
    - 文档化元数据字段

4. **类型安全**：

    - 定义事件接口
    - 正确类型化元数据
    - 使用 TypeScript 特性

5. **错误处理**：

    - 验证负载
    - 处理缺失数据
    - 考虑错误事件

6. **性能**：
    - 监控负载大小
    - 优化消息结构
    - 考虑序列化成本
