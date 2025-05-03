# scope() 方法

创建并返回一个新的事件作用域实例。

## 方法签名

```ts
scope(
    options?: FastEventScopeOptions<Meta, Context>
): FastEventScope<Events, Meta, Context>
```

## 参数

| 参数    | 类型                                 | 描述           |
| ------- | ------------------------------------ | -------------- |
| options | FastEventScopeOptions<Meta, Context> | 作用域配置选项 |

### options 配置

```ts
interface FastEventScopeOptions<Meta, Context> extends FastEventOptions<Meta, Context> {
    name?: string; // 作用域名称
}
```

## 返回值

返回 `FastEventScope<Events, Meta, Context>` 实例，具有与 FastEvent 相同的接口。

## 示例

### 创建基本作用域

```ts
// 创建子作用域
const userScope = emitter.scope({
    name: 'user',
    meta: { module: 'user' },
});

// 在作用域内监听事件
userScope.on('login', (data) => {
    console.log('用户登录:', data);
});

// 触发作用域内事件
userScope.emit('login', { userId: 123 });
```

### 创建隔离作用域

```ts
// 创建隔离作用域(不继承父级监听器)
const isolatedScope = emitter.scope({
    name: 'isolated',
});

// 隔离作用域内的事件不会影响父级
isolatedScope.on('event', handler);
```

### 作用域链

```ts
// 创建作用域链
const parentScope = emitter.scope({ name: 'parent' });
const childScope = parentScope.scope({ name: 'child' });

// 子作用域事件会冒泡到父作用域
childScope.on('event', () => {
    console.log('子作用域处理');
});

parentScope.on('event', () => {
    console.log('父作用域处理');
});

childScope.emit('event');
// 输出:
// 子作用域处理
// 父作用域处理
```

### 模块化开发示例

```ts
// user模块
const userModule = emitter.scope({
    name: 'user',
    delimiter: '.',
});

userModule.on('created', (user) => {
    console.log('用户创建:', user);
});

// product模块
const productModule = emitter.scope({
    name: 'product',
    delimiter: '.',
});

productModule.on('created', (product) => {
    console.log('产品创建:', product);
});

// 触发各自模块事件
userModule.emit('created', { id: 1, name: '张三' });
productModule.emit('created', { id: 101, name: '笔记本电脑' });
```
