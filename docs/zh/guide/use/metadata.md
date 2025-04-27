# 元数据系统

FastEvent 提供了灵活的元数据机制，允许为事件附加上下文信息，同时保持类型安全。

## 基本元数据

### 添加自定义元数据

```typescript
// 触发事件时添加元数据
emitter.emit(
    'user/login',
    { userId: '123' },
    false, // 不保留
    {
        ip: '192.168.1.1',
        device: 'iOS',
    },
);
```

## 类型安全的元数据

### 定义元数据类型

```typescript
interface AppMeta extends DefaultMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes, AppMeta>();

// 类型检查
emitter.emit('user/login', { userId: '123' }, false, {
    sessionId: 'session_123', // 必需字段
    requestId: 'req_123', // 可选字段
    timestamp: Date.now(), // 继承字段
    ip: '192.168.1.1', // ❌ 不在AppMeta中
});
```

### 作用域默认元数据

```typescript
// 创建带默认元数据的作用域
const apiScope = emitter.scope('api', {
    meta: {
        source: 'API',
        sessionId: 'default',
    },
});

// 会继承默认元数据
apiScope.emit('request', { path: '/' }, false, {
    requestId: 'req_123', // 只需提供额外字段
});
```

## 元数据访问

### 在监听器中访问

```typescript
emitter.on('user/action', (message) => {
    console.log('操作来源:', message.meta.source);
    console.log('设备信息:', message.meta.device);
});
```

### 获取保留事件的元数据

```typescript
emitter.emit('system/status', { online: true }, true);

const retained = emitter.getRetained('system/status');
console.log('状态更新时间:', new Date(retained.meta.timestamp));
```

## 使用场景

### 请求追踪

```typescript
// 为每个请求添加唯一ID
emitter.emit('api/request', params, false, {
    requestId: generateId(),
    startTime: Date.now(),
});

emitter.on('api/response', (message) => {
    const duration = Date.now() - message.meta.startTime;
    console.log(`请求 ${message.meta.requestId} 耗时: ${duration}ms`);
});
```

### 调试信息

```typescript
// 添加调试信息
emitter.emit('component/update', data, false, {
    debug: true,
    component: 'UserTable',
    version: '1.2.0',
});

// 开发环境记录调试信息
if (process.env.NODE_ENV === 'development') {
    emitter.onAny((message) => {
        if (message.meta.debug) {
            console.debug(message);
        }
    });
}
```

### 权限控制

```typescript
// 添加用户上下文
emitter.emit('document/update', doc, false, {
    userId: currentUser.id,
    roles: currentUser.roles,
});

// 验证权限
emitter.on('document/**', (message) => {
    if (!hasPermission(message.meta.roles)) {
        throw new Error('无权操作');
    }
});
```
