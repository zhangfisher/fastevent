# FastEventScope 类

事件作用域实现，提供隔离的事件命名空间。

## 类描述

FastEventScope 用于创建隔离的事件作用域，主要特性包括：

-   自动为事件类型添加/移除作用域前缀
-   支持多层级作用域嵌套
-   继承父作用域配置
-   隔离的事件命名空间

## 构造函数

```ts
constructor(
    emitter: FastEvent<Events>,
    prefix: string,
    options?: FastEventScopeOptions<Meta, Context>
)
```

### 参数

| 参数    | 类型                                 | 描述               |
| ------- | ------------------------------------ | ------------------ |
| emitter | FastEvent<Events>                    | 基础事件发射器实例 |
| prefix  | string                               | 作用域前缀         |
| options | FastEventScopeOptions<Meta, Context> | 作用域配置选项     |

### 配置选项

```ts
interface FastEventScopeOptions<Meta, Context> {
    meta?: FastEventMeta & Meta; // 元数据
    context?: Context; // 执行上下文
    executor?: FastListenerExecutorArgs; // 执行策略
}
```

## 核心方法

### scope() - 创建子作用域

```ts
scope<P extends string>(
    prefix: P,
    options?: FastEventScopeOptions<Partial<FinalMeta>, Context>
): FastEventScope<ScopeEvents<Events, P>, FinalMeta, Context>
```

创建新的子作用域，继承当前作用域配置。

#### 示例

```ts
const userScope = emitter.scope('user');
const profileScope = userScope.scope('profile');
```

### on() - 作用域内监听事件

```ts
on<T extends Types = Types>(
    type: T,
    listener: FastEventListener<Exclude<T, number | symbol>, Events[T], FinalMeta, Context>,
    options?: FastEventListenOptions
): FastEventSubscriber
```

监听作用域内事件，自动添加作用域前缀。

#### 示例

```ts
userScope.on('login', (data) => {
    console.log('用户登录:', data);
});
```

### emit() - 触发作用域内事件

```ts
emit<R = any>(
    type: Types,
    payload?: Events[Types],
    options?: FastEventListenerArgs<FinalMeta>
): R[]
```

触发作用域内事件，自动添加作用域前缀。

#### 示例

```ts
userScope.emit('login', { userId: 123 });
```

## 作用域特性

1. **前缀处理**:

    - 自动为事件类型添加/移除作用域前缀
    - 保持事件类型在作用域内的一致性

2. **配置继承**:

    - 子作用域继承父作用域的配置
    - 可覆盖特定配置项

3. **类型安全**:

    - 严格匹配事件类型和负载类型
    - 编译时类型检查

4. **隔离性**:
    - 不同作用域的事件相互隔离
    - 支持多层级命名空间

## 使用示例

### 模块化开发

```ts
// 用户模块
const userModule = emitter.scope('user', {
    meta: { module: 'user' },
});

userModule.on('login', (data) => {
    console.log('用户登录:', data);
});

// 产品模块
const productModule = emitter.scope('product', {
    meta: { module: 'product' },
});

productModule.on('create', (data) => {
    console.log('产品创建:', data);
});
```

### 多层级作用域

```ts
const appScope = emitter.scope('app');
const adminScope = appScope.scope('admin');
const userScope = appScope.scope('user');

adminScope.on('action', () => {
    /* ... */
});
userScope.on('action', () => {
    /* ... */
});
```

### 配置继承

```ts
const parentScope = emitter.scope('parent', {
    meta: { version: '1.0' },
    context: this,
});

const childScope = parentScope.scope('child', {
    meta: { debug: true }, // 继承version，新增debug
});
```

## 最佳实践

1. **模块隔离**:

    - 为每个功能模块创建独立作用域
    - 通过作用域前缀避免事件冲突

2. **配置管理**:

    - 在根作用域设置公共配置
    - 在子作用域覆盖特定配置

3. **生命周期**:

    - 作用域与模块生命周期一致
    - 及时清理不再使用的作用域

4. **调试追踪**:
    - 为作用域设置描述性名称
    - 通过 meta 字段添加调试信息
