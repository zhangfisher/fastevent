# offAll() 方法

取消所有事件的监听器订阅。

## 方法签名

```ts
offAll(): this
```

## 参数

无参数。

## 返回值

返回 FastEvent 实例自身，支持链式调用。

## 示例

### 基本用法

```ts
// 订阅多个事件
emitter.on('event1', handler1);
emitter.on('event2', handler2);
emitter.on('event3', handler3);

// 取消所有监听器
emitter.offAll();
```

### 应用场景示例

```ts
class UserComponent {
    constructor(emitter) {
        this.emitter = emitter;
        this.emitter.on('user.update', this.handleUpdate);
        this.emitter.on('user.delete', this.handleDelete);
    }

    destroy() {
        // 组件销毁时取消所有监听
        this.emitter.offAll();
    }
}
```

### 链式调用

```ts
emitter.on('event1', handler1).on('event2', handler2).offAll().on('event3', handler3); // 只保留event3的监听
```

### 测试用例清理

```ts
afterEach(() => {
    // 每个测试用例执行后清理所有监听器
    emitter.offAll();
});
```

## 特性说明

1. **影响范围**:

    - 清除所有事件类型的所有监听器
    - 包括通配符监听器('\*'和'\*\*')
    - 不影响保留的消息(retainedMessages)

2. **性能影响**:

    - 内部监听器树会被完全重置
    - 操作时间复杂度为 O(1)

3. **内存管理**:
    - 释放所有监听器引用
    - 有助于避免内存泄漏

## 与 off()方法的区别

| 特性     | offAll()  | off()      |
| -------- | --------- | ---------- |
| 作用范围 | 全局      | 特定事件   |
| 清除方式 | 全部清除  | 选择性清除 |
| 使用场景 | 重置/清理 | 精确控制   |
| 性能影响 | 较大      | 较小       |
