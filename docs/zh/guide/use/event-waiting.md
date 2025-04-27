# 事件等待机制

FastEvent 提供了强大的 `waitFor` 方法，可以异步等待特定事件的发生。

## 基本用法

### 等待事件

```typescript
// 等待事件发生
const message = await emitter.waitFor('system/ready');
console.log('系统已就绪:', message.payload);
```

### 带超时的等待

```typescript
try {
    const message = await emitter.waitFor('user/login', 5000);
    console.log('用户登录:', message.payload);
} catch (err) {
    console.log('等待用户登录超时');
}
```

## 高级用法

### 条件等待

```typescript
// 等待管理员登录
const adminLogin = await emitter.waitFor('user/login', {
    timeout: 10000,
    filter: (msg) => msg.payload.role === 'admin',
});
```

### 等待保留事件

```typescript
// 触发并保留事件
emitter.emit('config/loaded', config, true);

// 即使之后监听也能立即获取
const configMsg = await emitter.waitFor('config/loaded');
```

## 类型安全

```typescript
interface AppEvents {
    'user/login': { id: string; role: string };
    'data/ready': { items: string[] };
}

const emitter = new FastEvent<AppEvents>();

// 自动推断返回类型
const loginMsg = await emitter.waitFor('user/login');
// loginMsg 类型为 { type: 'user/login'; payload: { id: string; role: string } }

const dataMsg = await emitter.waitFor('data/ready', 3000);
// dataMsg 类型为 { type: 'data/ready'; payload: { items: string[] } }
```

## 使用场景

### 初始化顺序控制

```typescript
async function initialize() {
    await emitter.waitFor('db/connected');
    await emitter.waitFor('config/loaded');
    await emitter.waitFor('services/ready');
    startApplication();
}
```

### 测试验证

```typescript
test('用户登录流程', async () => {
    // 模拟登录
    setTimeout(() => emitter.emit('user/login', testUser), 100);

    // 等待登录事件
    const message = await emitter.waitFor('user/login');
    expect(message.payload.id).toBe(testUser.id);
});
```

## 注意事项

1. **超时处理**：总是考虑设置合理的超时时间
2. **内存泄漏**：未完成的 waitFor 会保持引用
3. **竞态条件**：确保事件确实会发生
4. **性能影响**：大量等待可能影响性能
5. **错误处理**：捕获可能的超时错误

## 与 once 对比

| 特性     | waitFor                  | once             |
| -------- | ------------------------ | ---------------- |
| 执行方式 | 异步(Promise)            | 同步             |
| 返回值   | 事件消息                 | 无               |
| 超时处理 | 支持                     | 不支持           |
| 使用场景 | 需要等待和超时控制的场景 | 简单的一次性逻辑 |

```typescript
// waitFor 更适合异步流程控制
async function setup() {
    try {
        await emitter.waitFor('db/ready', 5000);
        startApp();
    } catch {
        showTimeoutError();
    }
}

// once 更适合简单的一次性逻辑
emitter.once('first-render', initAnalytics);
```
