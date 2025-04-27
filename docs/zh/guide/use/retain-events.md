# 保留事件数据

FastEvent 的事件保留功能可以让新订阅者立即获取最后一次的事件数据，非常适合状态管理场景。

## 基本用法

### 触发并保留事件

```typescript
// 触发并保留事件
emitter.emit('system/status', { online: true }, true);

// 之后注册的监听器会立即收到保留的事件
emitter.on('system/status', (message) => {
    console.log('当前状态:', message.payload.online); // true
});
```

### 检查保留事件

```typescript
// 检查是否有保留事件
const hasRetained = emitter.hasRetained('system/status');

// 获取保留的事件数据
const retained = emitter.getRetained('system/status');
if (retained) {
    console.log('最后状态:', retained.payload);
}
```

## 类型安全

```typescript
interface AppEvents {
    'system/status': { online: boolean };
    'user/current': { id: string; name: string };
}

const emitter = new FastEvent<AppEvents>();

// 类型检查正常
emitter.emit('system/status', { online: true }, true);

// 类型错误
emitter.emit('system/status', { status: 'up' }, true); // ❌
```

## 使用场景

### 状态同步

```typescript
// 组件A: 更新并保留状态
emitter.emit('ui/theme', { mode: 'dark' }, true);

// 组件B: 初始化时获取当前主题
emitter.on('ui/theme', (message) => {
    applyTheme(message.payload.mode);
});
```

### 配置共享

```typescript
// 应用启动时加载配置
loadConfig().then((config) => {
    emitter.emit('app/config', config, true);
});

// 任何模块都可以获取最新配置
const currentConfig = emitter.getRetained('app/config');
```

### 跨组件通信

```typescript
// 用户登录后保留用户数据
emitter.emit('user/login', userData, true);

// 其他组件获取当前用户
emitter.on('user/login', (message) => {
    renderUserProfile(message.payload);
});
```

## 高级用法

### 保留事件生命周期

```typescript
// 清除保留事件
emitter.clearRetained('system/status');

// 清除所有保留事件
emitter.clearAllRetained();
```

### 保留事件变更监听

```typescript
emitter.onRetainedChange('user/current', (message) => {
    console.log('当前用户变更:', message?.payload);
});
```
