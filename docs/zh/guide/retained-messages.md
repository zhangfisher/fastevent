# 保留消息

保留消息是被存储并自动传递给新订阅者的事件。这个特性特别适用于维护状态或配置信息，这些信息是新订阅者需要知道的。

## 基本用法

### 发布保留消息

发布事件时将 `retain` 参数设为 `true`：

```typescript
const events = new FastEvent();

// 发布并保留事件
events.emit('config/theme', { mode: 'dark' }, true);

// 后续订阅者会立即收到保留的消息
events.on('config/theme', (message) => {
    console.log('当前主题:', message.payload);
    // 输出: "当前主题: { mode: 'dark' }"
});
```

### 检查保留消息

您可以检查是否有保留消息并获取它：

```typescript
// 检查是否有保留消息
const hasRetained = events.hasRetained('config/theme');

// 获取保留消息
const retainedMessage = events.getRetained('config/theme');
if (retainedMessage) {
    console.log('保留消息:', retainedMessage);
}
```

## 管理保留消息

### 清除特定消息

移除特定的保留消息：

```typescript
// 清除特定的保留消息
events.clearRetained('config/theme');

// 检查是否已清除
console.log(events.hasRetained('config/theme')); // false
```

### 清除所有消息

移除所有保留消息：

```typescript
// 清除所有保留消息
events.clearAllRetained();
```

## 作用域与保留消息

保留消息可以与作用域一起使用：

```typescript
const events = new FastEvent();
const configScope = events.scope('config');

// 在作用域中发布保留消息
configScope.emit('theme', { mode: 'dark' }, true);

// 这些是等价的:
events.hasRetained('config/theme');
configScope.hasRetained('theme');

// 清除作用域中的保留消息
configScope.clearRetained('theme'); // 清除特定消息
configScope.clearAllRetained(); // 清除作用域中的所有消息
```

## 使用场景

### 1. 配置管理

```typescript
const configEvents = events.scope('config');

// 设置初始配置
configEvents.emit(
    'settings',
    {
        theme: 'dark',
        language: 'en',
        notifications: true,
    },
    true,
);

// 组件初始化时可以获取当前配置
configEvents.on('settings', (message) => {
    initializeComponent(message.payload);
});
```

### 2. 状态广播

```typescript
const systemEvents = events.scope('system');

// 广播系统状态
systemEvents.emit(
    'status',
    {
        online: true,
        lastUpdate: Date.now(),
    },
    true,
);

// 新组件自动获取当前状态
systemEvents.on('status', (message) => {
    updateConnectionStatus(message.payload);
});
```

### 3. 功能开关

```typescript
const featureEvents = events.scope('features');

// 设置功能开关
featureEvents.emit(
    'flags',
    {
        newUI: true,
        beta: false,
    },
    true,
);

// 组件初始化时检查功能
featureEvents.on('flags', (message) => {
    enableFeatures(message.payload);
});
```

## 类型安全

使用 TypeScript 确保保留消息的类型安全：

```typescript
interface ConfigEvents {
    'config/theme': {
        mode: 'light' | 'dark';
        accent?: string;
    };
}

const events = new FastEvent<ConfigEvents>();

// 类型安全的发布
events.emit('config/theme', { mode: 'dark' }, true);

// 类型错误:
events.emit('config/theme', { mode: 'invalid' }, true);
```

## 最佳实践

1. **谨慎使用**：

    - 只保留必要的状态信息
    - 考虑内存使用
    - 清除不需要的保留消息

2. **作用域组织**：

    - 分组相关的保留消息
    - 使用清晰的命名约定
    - 维护作用域层次结构

3. **状态管理**：

    - 保持保留数据小巧
    - 状态变化时更新
    - 清除过时状态

4. **类型安全**：

    - 为保留消息定义接口
    - 使用 TypeScript 进行类型检查
    - 文档化消息结构

5. **内存管理**：

    - 监控保留消息数量
    - 不再需要时清除消息
    - 避免保留大型负载

6. **错误处理**：
    - 处理缺失的保留消息
    - 验证保留数据
    - 提供回退值
