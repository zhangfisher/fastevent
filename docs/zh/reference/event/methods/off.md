# off() 方法

取消指定事件的监听器订阅。

## 方法签名

```ts
// 取消特定监听器
off<T extends Types = Types>(
    type: T,
    listener: FastEventListener<Exclude<T, number | symbol>, Events[T], Meta, Fallback<Context, typeof this>>
): this

// 取消字符串事件类型的监听器
off<T extends string>(
    type: T,
    listener: FastEventAnyListener<Events, Meta, Fallback<Context, typeof this>>
): this

// 取消所有类型匹配的监听器
off<T extends Types = Types>(type: T): this
off<T extends string>(type: T): this
```

## 参数

| 参数     | 类型              | 描述                     |
| -------- | ----------------- | ------------------------ |
| type     | T \| string       | 要取消的事件类型         |
| listener | FastEventListener | 要取消的监听器函数(可选) |

## 返回值

返回 FastEvent 实例自身，支持链式调用。

## 示例

### 取消特定监听器

```ts
function handleLogin(data) {
    console.log('登录处理:', data);
}

// 订阅事件
emitter.on('user.login', handleLogin);

// 取消订阅
emitter.off('user.login', handleLogin);
```

### 取消所有类型匹配的监听器

```ts
// 订阅多个监听器
emitter.on('user.logout', handler1);
emitter.on('user.logout', handler2);

// 取消所有user.logout事件的监听器
emitter.off('user.logout');
```

### 链式调用

```ts
emitter.on('event1', handler1).on('event2', handler2).off('event1', handler1).emit('event2', data);
```

### 结合 once 使用

```ts
// 自动取消的场景
const subscription = emitter.once('temp.event', handler);

// 手动提前取消
subscription.off();
```

## 匹配规则

1. **精确匹配**:

    - 必须完全匹配事件类型
    - 必须完全匹配监听器函数引用
    - 匿名函数无法单独取消

2. **通配符处理**:

    - 支持取消通配符订阅
    - 需要完全匹配原始通配符表达式

3. **性能优化**:
    - 内部使用精确查找算法
    - 时间复杂度 O(1)到 O(n)

## 与 offAll()方法的区别

| 特性     | off()        | offAll() |
| -------- | ------------ | -------- |
| 作用范围 | 特定事件类型 | 所有事件 |
| 精确性   | 可指定监听器 | 全部清除 |
| 使用场景 | 精确取消     | 全局清理 |
| 性能影响 | 局部更新     | 完全重置 |
