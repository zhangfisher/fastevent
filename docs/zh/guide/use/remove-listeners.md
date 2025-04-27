# 移除事件监听器

FastEvent 提供了多种方式来移除事件监听器，确保灵活的内存管理和资源释放。

## 基本移除方式

### 移除特定监听器

```typescript
const handler = (message) => console.log(message);

// 添加监听器
emitter.on('event', handler);

// 移除特定监听器
emitter.off('event', handler);
```

### 移除所有监听器

```typescript
// 移除特定事件的所有监听器
emitter.off('event');

// 移除所有事件的所有监听器
emitter.offAll();
```

## 作用域中的移除

### 移除作用域监听器

```typescript
const scope = emitter.scope('user');

// 添加作用域监听器
scope.on('login', handler);

// 移除作用域监听器
scope.off('login', handler);

// 移除作用域下所有监听器
scope.offAll();
```

## 高级移除方式

### 使用引用移除

```typescript
// 获取监听器引用
const subscription = emitter.on('event', handler);

// 通过引用移除
subscription.off();
```

### 条件移除

```typescript
// 移除满足条件的所有监听器
emitter.off('event', {
    filter: (listener) => listener.context === someContext,
});
```

## 移除保留事件

```typescript
// 触发并保留事件
emitter.emit('status', { value: 1 }, true);

// 移除保留的事件数据
emitter.off('status', { removeRetained: true });
```

## 最佳实践

1. **及时清理**：在组件卸载或对象销毁时移除相关监听器
2. **引用追踪**：维护监听器引用以便后续移除
3. **作用域管理**：合理使用作用域简化清理工作
4. **避免内存泄漏**：确保长期运行的监听器被正确管理
5. **调试辅助**：在开发环境检查监听器数量

## 调试监听器

```typescript
// 检查特定事件的监听器数量
const count = emitter.listenerCount('event');

// 获取所有监听器信息
const listeners = emitter.getListeners('event');
```
