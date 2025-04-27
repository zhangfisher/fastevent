# 多级事件与通配符

FastEvent 提供了强大的多级事件匹配系统，支持灵活的事件路由和处理。

## 多级事件结构

### 层级分隔符

默认使用 `/` 作为分隔符，可自定义：

```typescript
// 使用自定义分隔符
const emitter = new FastEvent({
    delimiter: ':', // 使用冒号作为分隔符
});

emitter.on('user:login', handler);
```

### 事件层级示例

```typescript
// 系统事件
'system/start';
'system/shutdown';

// 用户事件
'user/login';
'user/profile/update';
'user/notifications/new';

// 订单事件
'order/create';
'order/update/status';
'order/items/add';
```

## 通配符匹配规则

### 单层通配符 (\*)

匹配单层中的任意事件：

```typescript
// 匹配所有第一级为 user 的事件
emitter.on('user/*', handler);
// 匹配: user/login, user/logout
// 不匹配: user/profile/update
```

### 多层通配符 (\*\*)

匹配任意层级的路径：

```typescript
// 匹配所有 user 下的事件
emitter.on('user/**', handler);
// 匹配: user/login, user/profile/update
```

### 混合通配符

```typescript
// 匹配所有 update 操作
emitter.on('*/update', handler);

// 匹配所有第二级为 status 的事件
emitter.on('*/*/status', handler);
```

## 类型安全匹配

```typescript
interface AppEvents {
    'user/login': { id: string };
    'user/logout': { id: string };
    'user/profile/update': { name: string };
    'system/start': void;
}

const emitter = new FastEvent<AppEvents>();

// 类型安全的通配符监听
emitter.on('user/*', (message) => {
    // message.payload 类型为 { id: string }
    console.log(message.payload.id);
});

emitter.on('user/**', (message) => {
    if (message.type === 'user/profile/update') {
        // 类型推断为 { name: string }
        console.log(message.payload.name);
    } else {
        // 类型推断为 { id: string }
        console.log(message.payload.id);
    }
});
```

## 匹配优先级

1. **精确匹配**：最高优先级
2. **单层通配符**：中等优先级
3. **多层通配符**：最低优先级

```typescript
emitter.on('user/login', () => console.log('精确'));
emitter.on('user/*', () => console.log('单层通配'));
emitter.on('**', () => console.log('多层通配'));

emitter.emit('user/login');
// 输出顺序:
// 精确
// 单层通配
// 多层通配
```

## 使用场景

### 模块化事件处理

```typescript
// 用户模块处理所有用户事件
emitter.on('user/**', userModule.handle);

// 订单模块处理所有订单事件
emitter.on('order/**', orderModule.handle);
```

### 全局日志

```typescript
// 记录所有事件
emitter.on('**', (message) => {
    logger.log(`[${message.type}]`, message.payload);
});
```

### 权限拦截

```typescript
// 拦截所有 admin 操作
emitter.on('admin/**', (message) => {
    if (!currentUser.isAdmin) {
        throw new Error('无权访问');
    }
});
```
