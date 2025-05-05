# 事件通配符

FastEvent 提供了强大的通配符功能，可以灵活地匹配多个事件。

## 通配符类型

### 单层通配符 (\*)

匹配单层路径中的任意事件：

```typescript
// 监听所有 user 下的直接子事件
emitter.on('user/*', (message) => {
    console.log(`用户事件: ${message.type}`);
    // 匹配: user/login, user/logout
    // 不匹配: user/profile/update
});
```

### 多层通配符 (\*\*)

匹配任意多层路径的事件：

```typescript
// 监听所有 user 下的任意层级事件
emitter.on('user/**', (message) => {
    console.log(`用户相关事件: ${message.type}`);
    // 匹配: user/login, user/profile/update
});
```

## 通配符规则

1. **分隔符**：默认使用 `/` 作为路径分隔符
2. **优先级**：精确匹配 > 单层通配符 > 多层通配符
3. **性能**：通配符监听器比精确匹配稍慢

## 类型安全示例

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'user/profile/update': { name: string };
    'order/create': { orderId: string };
}

const emitter = new FastEvent<AppEvents>();

// 类型安全的通配符监听
emitter.on('user/*', (message) => {
    // message.payload 类型为 { userId: string }
    // 因为只匹配 user/login 和 user/logout
    console.log(message.payload.userId);
});

emitter.on('user/**', (message) => {
    // message.payload 类型为 { userId: string } | { name: string }
    if (message.type === 'user/profile/update') {
        console.log(message.payload.name);
    } else {
        console.log(message.payload.userId);
    }
});
```

## 使用场景

1. **日志记录**：监听一组相关事件

```typescript
emitter.on('**', (message) => {
    logger.log(`[${message.type}]`, message.payload);
});
```

2. **权限检查**：拦截特定领域的事件

```typescript
emitter.on('admin/**', (message) => {
    if (!currentUser.isAdmin) {
        throw new Error('无权访问');
    }
});
```

3. **数据聚合**：收集相关事件数据

```typescript
const analyticsData = {};

emitter.on('analytics/**', (message) => {
    analyticsData[message.type] = message.payload;
});
```
