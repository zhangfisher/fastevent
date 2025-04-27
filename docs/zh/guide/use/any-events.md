# 全局事件监听

FastEvent 的 `onAny` 方法允许监听所有事件，为日志记录、监控和全局处理提供强大支持。

## 基本用法

### 监听所有事件

```typescript
// 监听所有事件
emitter.onAny((message) => {
    console.log(`[${message.type}]`, message.payload);
});
```

### 带类型的全局监听

```typescript
// 只处理特定payload类型的事件
emitter.onAny<string>((message) => {
    console.log('字符串事件:', message.payload.toUpperCase());
});
```

## 类型安全

```typescript
interface AppEvents {
    'user/login': { id: string };
    'system/start': { version: string };
    notify: string;
}

const emitter = new FastEvent<AppEvents>();

// 自动推断payload类型
emitter.onAny((message) => {
    if (message.type === 'notify') {
        // message.payload 类型为 string
        console.log('通知:', message.payload);
    } else {
        // message.payload 类型为 { id: string } | { version: string }
        console.log('事件数据:', message.payload);
    }
});
```

## 使用场景

### 事件日志记录

```typescript
// 记录所有事件到分析系统
emitter.onAny((message) => {
    analytics.track(message.type, {
        ...message.payload,
        timestamp: message.meta.timestamp,
    });
});
```

### 性能监控

```typescript
const eventMetrics = {};

emitter.onAny((message) => {
    if (!eventMetrics[message.type]) {
        eventMetrics[message.type] = 0;
    }
    eventMetrics[message.type]++;
});

// 定期上报事件统计
setInterval(() => {
    reportMetrics(eventMetrics);
}, 60000);
```

### 全局错误处理

```typescript
emitter.onAny((message) => {
    try {
        // 业务处理...
    } catch (error) {
        console.error(`处理事件 ${message.type} 失败:`, error);
    }
});
```

## 高级用法

### 条件过滤

```typescript
// 只处理特定领域的事件
emitter.onAny(
    (message) => {
        if (message.type.startsWith('user/')) {
            handleUserEvent(message);
        }
    },
    {
        filter: (msg) => msg.type.startsWith('user/'),
    },
);
```

### 带上下文的监听

```typescript
const logger = {
    name: 'EventLogger',
    log(message) {
        console.log(`[${this.name}]`, message.type);
    },
};

emitter.onAny(logger.log, { context: logger });
```
