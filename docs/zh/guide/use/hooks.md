# 事件钩子

FastEvent 提供了丰富的生命周期钩子，允许你在事件处理的关键节点注入自定义逻辑。

## 核心钩子

### 监听器添加钩子

```typescript
const emitter = new FastEvent({
    onAddListener(parts, listener) {
        console.log(`添加监听器: ${parts.join('/')}`);
        console.log('监听器函数:', listener);
    },
});
```

### 监听器移除钩子

```typescript
const emitter = new FastEvent({
    onRemoveListener(parts, listener) {
        console.log(`移除监听器: ${parts.join('/')}`);
    },
});
```

### 事件触发钩子

```typescript
const emitter = new FastEvent({
    onEmit(event, payload, retain) {
        console.log(`触发事件: ${event}`);
        console.log('事件数据:', payload);
        console.log('是否保留:', retain);
    },
});
```

## 高级钩子

### 监听器执行钩子

```typescript
const emitter = new FastEvent({
    onListenerCalled(event, listener, message) {
        const start = Date.now();
        const result = listener(message);
        const duration = Date.now() - start;

        console.log(`监听器执行耗时: ${duration}ms`);
        return result;
    },
});
```

### 错误处理钩子

```typescript
const emitter = new FastEvent({
    onError(error, event, payload) {
        console.error(`处理事件 ${event} 时出错:`, error);
        console.log('事件数据:', payload);

        // 返回true表示错误已处理，不再抛出
        return true;
    },
});
```

## 使用场景

### 性能监控

```typescript
const emitter = new FastEvent({
    onListenerCalled(event, listener, message) {
        const start = performance.now();
        try {
            return listener(message);
        } finally {
            const duration = performance.now() - start;
            metrics.record(event, duration);
        }
    },
});
```

### 调试追踪

```typescript
const emitter = new FastEvent({
    onAddListener(parts) {
        debug.trackListener(parts.join('/'));
    },
    onEmit(event) {
        debug.logEvent(event);
    },
});
```

### 权限控制

```typescript
const emitter = new FastEvent({
    onEmit(event, payload, meta) {
        if (event.startsWith('admin/') && !meta?.isAdmin) {
            throw new Error('无权触发管理员事件');
        }
    },
});
```

## 类型安全

```typescript
interface Hooks {
    onAddListener?: (parts: string[], listener: Function) => void;
    onRemoveListener?: (parts: string[], listener: Function) => void;
    onEmit?: <T extends string>(event: T, payload: any, retain: boolean) => void;
    onListenerCalled?: <T extends string>(event: T, listener: Function, message: FastEventMessage<T>) => any;
    onError?: (error: Error, event: string, payload?: any) => boolean | void;
}

const emitter = new FastEvent<MyEvents, MyMeta>({
    onEmit(event, payload) {
        // event 和 payload 会自动推断类型
        if (event === 'user/login') {
            console.log(payload.userId); // ✅ 类型安全
        }
    },
} as Hooks);
```
