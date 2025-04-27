# 一次性事件

FastEvent 提供了便捷的一次性事件监听机制，确保监听器只被调用一次后自动移除。

## 基本用法

### 标准方式

```typescript
emitter.once('user/login', (message) => {
    console.log('用户登录(首次):', message.payload);
});
```

### 带选项的方式

```typescript
emitter.once('user/login', handler, {
    context: authService, // 执行上下文
    priority: 10, // 优先级
});
```

## 类型安全示例

```typescript
interface AppEvents {
    'user/login': { userId: string };
    'system/ready': void;
}

const emitter = new FastEvent<AppEvents>();

// 类型检查正常
emitter.once('user/login', (message) => {
    console.log(message.payload.userId); // ✅
});

// 类型错误
emitter.once('user/login', (message) => {
    console.log(message.payload.nonExist); // ❌
});
```

## 使用场景

### 初始化逻辑

```typescript
// 只在系统准备就绪时执行一次
emitter.once('system/ready', initializeApp);
```

### 等待用户首次交互

```typescript
// 监听用户第一次点击
emitter.once('ui/first-click', setupTutorial);
```

### 资源加载

```typescript
// 确保配置只加载一次
emitter.once('config/loaded', cacheConfig);
```

## 高级用法

### 带条件的一次性监听

```typescript
// 只在满足条件时触发一次
emitter.once('data/update', handler, {
    filter: (msg) => msg.payload.version > 1,
});
```

### 组合使用

```typescript
emitter.once(
    'order/complete',
    (message) => {
        console.log('订单完成:', message.payload);
    },
    {
        context: orderService,
        priority: 100,
    },
);
```

## 注意事项

1. **性能考虑**：相比普通监听器有额外开销
2. **竞态条件**：确保事件确实会发生
3. **内存管理**：未触发的一次性监听器也会占用内存
4. **替代方案**：考虑使用 `waitFor` 处理异步场景

## 与 waitFor 对比

| 特性     | once             | waitFor                  |
| -------- | ---------------- | ------------------------ |
| 执行方式 | 同步             | 异步(Promise)            |
| 超时处理 | 不支持           | 支持超时设置             |
| 返回值   | 无               | 返回事件消息             |
| 使用场景 | 简单的一次性逻辑 | 需要等待和超时控制的场景 |

```typescript
// once 示例
emitter.once('ready', () => console.log('准备就绪'));

// waitFor 示例
try {
    const message = await emitter.waitFor('ready', 5000);
    console.log('准备就绪:', message);
} catch {
    console.log('等待超时');
}
```
