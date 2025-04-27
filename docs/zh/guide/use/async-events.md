# 异步事件处理

FastEvent 提供了完整的异步事件处理方案，支持异步触发和等待事件。

## 异步触发事件

### emitAsync 基础用法

```typescript
// 触发异步事件并等待所有监听器完成
const results = await emitter.emitAsync('data/process', inputData);

// 处理结果
results.forEach((result) => {
    if (result instanceof Error) {
        console.error('处理失败:', result);
    } else {
        console.log('处理结果:', result);
    }
});
```

### 带选项的异步触发

```typescript
const results = await emitter.emitAsync(
    {
        type: 'user/update',
        payload: userData,
        meta: { source: 'API' },
    },
    {
        timeout: 2000, // 单个监听器超时时间(毫秒)
    },
);
```

## 异步监听器

### 异步监听器示例

```typescript
emitter.on('image/process', async (message) => {
    const result = await processImage(message.payload);
    return result; // 返回值会出现在emitAsync的结果中
});
```

### 并行处理控制

```typescript
emitter.on(
    'batch/process',
    async (message) => {
        // 并行处理数组数据
        const results = await Promise.all(message.payload.map((item) => processItem(item)));
        return results;
    },
    {
        parallel: true, // 允许并行处理(默认false)
    },
);
```

## 等待事件

### 基本等待

```typescript
// 等待特定事件发生
const message = await emitter.waitFor('system/ready');

// 带超时的等待
try {
    const message = await emitter.waitFor('user/login', 5000);
    console.log('用户登录:', message.payload);
} catch (err) {
    console.log('等待超时');
}
```

### 条件等待

```typescript
// 等待满足条件的事件
const adminLogin = await emitter.waitFor('user/login', {
    timeout: 10000,
    filter: (msg) => msg.payload.role === 'admin',
});
```

## 类型安全示例

```typescript
interface AppEvents {
    'data/process': { input: string };
    'user/login': { id: string; role: string };
}

const emitter = new FastEvent<AppEvents>();

// 类型安全的异步触发
const results = await emitter.emitAsync('data/process', { input: 'test' });
// results 类型为 Array<string | Error>

// 类型安全的等待
const loginMsg = await emitter.waitFor('user/login');
// loginMsg 类型为 { type: 'user/login'; payload: { id: string; role: string } }
```

## 错误处理

### 监听器错误捕获

```typescript
emitter.on('task/run', async () => {
    throw new Error('任务失败');
});

const [result] = await emitter.emitAsync('task/run');
if (result instanceof Error) {
    console.error('任务执行失败:', result.message);
}
```

### 全局错误处理

```typescript
emitter.onError((error, event) => {
    console.error(`处理事件 ${event.type} 时出错:`, error);
});
```

## 性能优化

1. **批量处理**：对数组数据使用并行处理
2. **超时设置**：避免无限期等待
3. **结果缓存**：对重复请求缓存结果
4. **限流控制**：限制并发处理数量

## 使用场景

### API 请求编排

```typescript
async function fetchUserData(userId) {
    emitter.emitAsync('api/request', { userId });
    const [profile, orders] = await Promise.all([emitter.waitFor('profile/loaded'), emitter.waitFor('orders/loaded')]);
    return { profile, orders };
}
```

### 工作流控制

```typescript
// 步骤1: 验证输入
await emitter.emitAsync('input/validate', data);

// 步骤2: 处理数据
const [processed] = await emitter.emitAsync('data/transform', data);

// 步骤3: 保存结果
await emitter.emitAsync('data/save', processed);
```
