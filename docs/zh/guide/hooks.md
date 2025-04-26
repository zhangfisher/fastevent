# 事件钩子

FastEvent 提供了多个钩子用于监控和调试事件系统。这些钩子允许您跟踪监听器的注册、执行和错误。

## 可用钩子

FastEvent 支持以下钩子：

### 监听器管理钩子

1. **onAddListener** (添加监听器时)

```typescript
const events = new FastEvent({
    onAddListener: (path: string[], listener: Function) => {
        console.log('添加了新的监听器:', path.join('/'));
    },
});
```

2. **onRemoveListener** (移除监听器时)

```typescript
const events = new FastEvent({
    onRemoveListener: (path: string[], listener: Function) => {
        console.log('移除了监听器:', path.join('/'));
    },
});
```

3. **onClearListeners** (清除监听器时)

```typescript
const events = new FastEvent({
    onClearListeners: () => {
        console.log('已清除所有监听器');
    },
});
```

### 错误处理钩子

**onListenerError** (监听器抛出错误时)

```typescript
const events = new FastEvent({
    ignoreErrors: true, // 必须设置为 true 才能处理错误
    onListenerError: (type: string, error: Error) => {
        console.error(`事件 ${type} 的监听器发生错误:`, error);
        // 记录到监控系统
    },
});
```

### 执行监控钩子

**onExecuteListener** (仅在调试模式下)

```typescript
const events = new FastEvent({
    debug: true, // 必须设置为 true 才能监控执行
    onExecuteListener: (message, returns, listeners) => {
        console.log('事件执行完成:', {
            类型: message.type,
            监听器数量: listeners.length,
            执行结果: returns,
        });
    },
});
```

## 完整示例

展示所有钩子的使用：

```typescript
const events = new FastEvent({
    debug: true,
    ignoreErrors: true,

    // 监听器管理
    onAddListener: (path, listener) => {
        console.log(`添加了 ${path.join('/')} 的监听器`);
    },
    onRemoveListener: (path, listener) => {
        console.log(`移除了 ${path.join('/')} 的监听器`);
    },
    onClearListeners: () => {
        console.log('所有监听器已清除');
    },

    // 错误处理
    onListenerError: (type, error) => {
        console.error(`${type} 中发生错误:`, error);
    },

    // 执行监控
    onExecuteListener: (message, returns, listeners) => {
        console.log(`事件 ${message.type} 执行完成:`, {
            执行时间: Date.now(),
            监听器数量: listeners.length,
            执行结果: returns,
        });
    },
});

// 示例用法
events.on('user/login', () => {
    // 将调用 onAddListener
    console.log('用户登录');
});

events.on('data/process', () => {
    throw new Error('处理失败');
    // 将调用 onListenerError
});

events.emit('user/login', { id: 1 });
// 将调用 onExecuteListener

events.offAll();
// 将调用 onClearListeners
```

## 使用场景

### 1. 调试和监控

```typescript
const events = new FastEvent({
    debug: true,
    onExecuteListener: (message, returns, listeners) => {
        console.log('事件性能:', {
            类型: message.type,
            执行时间: Date.now() - message.meta.startTime,
            监听器数量: listeners.length,
        });
    },
});
```

### 2. 错误追踪

```typescript
const events = new FastEvent({
    ignoreErrors: true,
    onListenerError: (type, error) => {
        errorTrackingService.report({
            事件类型: type,
            错误: error,
            时间戳: Date.now(),
        });
    },
});
```

### 3. 监听器分析

```typescript
const events = new FastEvent({
    onAddListener: (path) => {
        analytics.track('event_subscription', {
            路径: path.join('/'),
            时间戳: Date.now(),
        });
    },
});
```

## 最佳实践

1. **调试模式使用**：

    - 仅在开发/测试时启用
    - 用于性能监控
    - 生产环境不需要时应禁用

2. **错误处理**：

    - 适当处理错误
    - 记录错误以便监控
    - 考虑错误恢复策略

3. **性能监控**：

    - 跟踪执行时间
    - 监控监听器数量
    - 关注错误模式

4. **清理**：

    - 跟踪监听器的添加/移除
    - 监控潜在内存泄漏
    - 确保适当清理

5. **生产环境使用**：
    - 考虑性能影响
    - 仅记录必要信息
    - 优雅处理错误
