# 元数据系统

FastEvent 的元数据系统提供了一种强大的方式，可以在不同层级为事件附加额外的上下文信息。

## 标准消息格式

FastEvent 中的所有事件都遵循以下标准化格式：

```typescript
type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T; // 完整事件路径（如 'user/profile/update'）
    payload: P; // 事件特定数据
    meta: M; // 合并自所有层级的元数据
};
```

## 元数据来源

FastEvent 提供三个层级的元数据：

### 1. 全局元数据（构造函数选项）

```typescript
const events = new FastEvent({
    meta: { version: '1.0', environment: 'production' },
});
```

### 2. 作用域元数据（创建作用域时）

```typescript
const userScope = events.scope('user', {
    meta: { domain: 'user' },
});
```

### 3. 事件元数据（发布事件时）

```typescript
events.emit('event', data, false, {
    timestamp: Date.now(),
});
```

## 元数据合并

### 优先级顺序

不同来源的元数据按以下优先级合并（从高到低）：

1. 事件特定元数据
2. 作用域元数据（从内到外）
3. 全局元数据
4. 系统元数据（type 总是被添加）

### 合并行为

-   仅顶层属性（浅合并）
-   后定义的值覆盖先前的
-   数组会被替换而不是连接

### 特殊情况

-   `type` 总是保留为完整事件路径
-   `undefined` 会从结果中移除该属性
-   可以添加新属性

## 完整示例

展示跨不同层级的元数据合并：

```typescript
const events = new FastEvent({
    meta: { app: 'MyApp' },
});

const userScope = events.scope('user', {
    meta: { domain: 'user' },
});

userScope.emit('login', { id: 1 }, false, { timestamp: Date.now() });

userScope.on('login', (message) => {
    console.log(message.meta);
    // {
    //   type: 'user/login',
    //   app: 'MyApp',
    //   domain: 'user',
    //   timestamp: 1620000000000
    // }
});
```

## 类型安全与元数据

对于 TypeScript 用户，可以严格强制元数据类型：

```typescript
interface MyMeta {
    version: string;
    timestamp?: number;
}

const events = new FastEvent<MyEvents, MyMeta>({
    meta: { version: '1.0' }, // 必须符合 MyMeta
});

// 类型检查的元数据
events.emit('event', {}, false, {
    timestamp: Date.now(), // 根据 MyMeta 可选
});
```

## 最佳实践

1. **使用全局元数据**存储应用级常量：

    - 版本号
    - 环境信息
    - 应用标识符

2. **使用作用域元数据**存储领域特定信息：

    - 功能区域
    - 用户角色
    - 组件标识符

3. **使用事件元数据**存储临时信息：

    - 时间戳
    - 请求 ID
    - 操作特定数据

4. **保持元数据轻量**：

    - 避免大型对象
    - 仅使用必要字段
    - 考虑性能影响

5. **类型化元数据**：

    - 为元数据定义接口
    - 利用 TypeScript 的类型系统
    - 文档化预期字段

6. **错误处理**：
    - 验证元数据
    - 处理缺失数据
    - 提供合理的默认值
