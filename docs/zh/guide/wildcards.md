# 通配符

FastEvent 支持强大的通配符模式进行事件订阅，允许您使用单个监听器处理多个事件。

## 通配符类型

FastEvent 支持两种通配符：

### 1. 单级通配符 (\*)

`*` 通配符匹配事件路径中的一个层级：

```typescript
const events = new FastEvent();

// 匹配任意用户类型
events.on('user/*/login', (message) => {
    const userType = message.type.split('/')[1];
    console.log('用户类型:', userType);
});

// 会匹配:
events.emit('user/admin/login', data); // 用户类型: admin
events.emit('user/guest/login', data); // 用户类型: guest

// 不会匹配:
events.emit('user/login', data); // 缺少中间段
events.emit('user/a/b/login', data); // 层级过多
```

### 2. 多级通配符 (\*\*)

`**` 通配符匹配事件路径中的零个或多个层级：

```typescript
const events = new FastEvent();

// 匹配所有用户相关事件
events.on('user/**', (message) => {
    console.log('用户事件:', message.type);
});

// 会匹配:
events.emit('user/login', data);
events.emit('user/profile/update', data);
events.emit('user/settings/theme/change', data);
```

## 重要规则

1. `**` 通配符必须在路径末尾

```typescript
// 有效
events.on('api/**', handler);

// 无效 - 不会按预期工作
events.on('api/**/users', handler);
```

2. `*` 可以在路径中多次使用

```typescript
// 有效 - 匹配任意资源上的任意操作
events.on('api/*/action/*', handler);
```

3. 不能在单个段中组合通配符

```typescript
// 无效
events.on('api/**/*', handler);
events.on('user/**/login', handler);
```

## 访问匹配段

使用通配符时，可以通过事件类型访问匹配的段：

```typescript
events.on('api/*/users/*/action', (message) => {
    const [, version, , userId] = message.type.split('/');
    console.log(`API ${version} - 用户 ${userId}`);
});

events.emit('api/v1/users/123/action', data);
// 输出: "API v1 - 用户 123"
```

## 性能考虑

1. **模式特异性**：

    - 不使用通配符的具体模式匹配最快
    - `*` 通配符比 `**` 更高效
    - 限制 `**` 通配符的使用以提高性能

2. **模式顺序**：
    - 更具体的模式应该先注册
    - `**` 模式应该最后注册
    - 考虑模式匹配的顺序

## 类型安全与通配符

虽然 TypeScript 为确切事件类型提供类型安全，但通配符监听器需要小心处理：

```typescript
interface ApiEvents {
    'api/users/create': { name: string };
    'api/users/delete': { id: number };
}

const events = new FastEvent<ApiEvents>();

// 精确匹配 - 完全类型化
events.on('api/users/create', (message) => {
    const { name } = message.payload; // 类型为 { name: string }
});

// 通配符 - 负载类型为 'any'
events.on('api/users/*', (message) => {
    // message.payload 类型不被保留
    console.log('API 事件:', message.type);
});
```

## 最佳实践

1. **尽可能使用具体模式**：

    - 优先使用精确匹配而非通配符
    - 能用 `*` 时不要用 `**`
    - 保持模式尽可能具体

2. **组织事件层次结构**：

    - 设计事件路径时考虑通配符
    - 逻辑分组相关事件
    - 考虑模式匹配性能

3. **处理类型安全**：

    - 注意通配符的类型限制
    - 需要时添加运行时类型检查
    - 文档化预期的负载类型

4. **监控性能**：

    - 关注慢速模式匹配
    - 优化通配符使用
    - 考虑监听器数量

5. **清晰文档**：
    - 文档化通配符模式
    - 解释匹配行为
    - 提供清晰的示例
