# FastEvent

FastEvent 是一个功能强大的`TypeScript`事件管理库，提供了灵活的事件订阅和发布机制，支持事件通配符、作用域、异步事件等特性。

对比`EventEmitter2`，`FastEvent`具有以下优势：

- 在含通配符发布与订阅时，`FastEvent`的性能比`EventEmitter2`高 `1+`倍左右。
- `FastEvent`包大小为 `6.3xkb`，而`EventEmitter2`为 `43.4kb`。
- `FastEvent`拥有更丰富的功能。

# 安装

使用 npm 安装:

```bash
npm install fastevent
```

或使用 yarn:

```bash
yarn add fastevent
```

# 快速入门

## 基本使用

```typescript
import { FastEvent } from 'fastevent';

// 创建事件实例
const events = new FastEvent();

// 订阅事件
events.on('user/login', (user) => {
  console.log('用户登录:', user);
});

// 发布事件
events.emit('user/login', { id: 1, name: 'Alice' });
```

# 指南

## 事件通配符

FastEvent 支持两种通配符：
- `*`: 匹配单层路径
- `**`: 匹配多层路径

```typescript
const events = new FastEvent();

// 匹配 user/*/login
events.on('user/*/login', (data) => {
  console.log('任何用户类型的登录:', data);
});

// 匹配 user 下的所有事件
events.on('user/**', (data) => {
  console.log('所有用户相关事件:', data);
});

// 触发事件
events.emit('user/admin/login', { id: 1 });  // 两个处理器都会被调用
events.emit('user/admin/profile/update', { name: 'New' });  // 只有 ** 处理器会被调用
```

## 事件作用域

作用域允许你在特定的命名空间下处理事件：

```typescript
const events = new FastEvent();

// 创建用户相关的作用域
const userScope = events.scope('user');

// 在作用域中订阅事件
userScope.on('login', (data) => {
  console.log('用户登录:', data);
});

// 等同于 events.emit('user/login', data)
userScope.emit('login', { id: 1 });
```

## 一次性事件

使用 `once` 订阅只触发一次的事件：

```typescript
const events = new FastEvent();

events.once('startup', () => {
  console.log('应用启动');
});

events.emit('startup');  // 输出: 应用启动
events.emit('startup');  // 无输出，监听器已被移除
```

## 异步事件

支持异步事件处理：

```typescript
const events = new FastEvent();

events.on('data/fetch', async () => {
  const response = await fetch('https://api.example.com/data');
  return await response.json();
});

// 异步发布事件
const results = await events.emitAsync('data/fetch');
console.log('所有处理器的结果:', results);
```

## 事件等待

使用 `waitFor` 等待特定事件发生：

```typescript
const events = new FastEvent();

async function waitForLogin() {
  try {
    // 等待登录事件，超时时间 5 秒
    const userData = await events.waitFor('user/login', 5000);
    console.log('用户已登录:', userData);
  } catch (error) {
    console.log('登录等待超时');
  }
}

waitForLogin();
// 稍后触发登录事件
events.emit('user/login', { id: 1, name: 'Alice' });
```

## 保留事件数据

保留最后一次事件数据，新的订阅者会立即收到该数据：

```typescript
const events = new FastEvent();

// 发布事件并保留
events.emit('config/update', { theme: 'dark' }, true);

// 之后的订阅者会立即收到保留的数据
events.on('config/update', (config) => {
  console.log('配置:', config);  // 立即输出: 配置: { theme: 'dark' }
});
```

## 多级事件

支持发布和订阅多级事件。

默认使用 `/` 作为事件路径分隔符，你也可以使用自定义的分隔符：

```typescript
const events = new FastEvent({
  delimiter: '.'
});
```

## 全局事件监听

使用 `onAny` 监听所有事件：

```typescript
const events = new FastEvent();

events.onAny((data, meta) => {
  console.log(`事件 ${meta.type} 被触发:`, data);
});

events.emit('user/login', { id: 1 });  // 输出: 事件 user/login 被触发: { id: 1 }
events.emit('system/error', 'Connection failed');  // 输出: 事件 system/error 被触发: Connection failed
```

## 元数据(Meta)

元数据是一种为事件提供额外上下文信息的机制。你可以在全局范围内设置元数据，也可以为单个事件添加特定的元数据。

### 全局元数据

在创建 FastEvent 实例时设置全局元数据：

```typescript
const events = new FastEvent({
  meta: {
    version: '1.0',
    environment: 'production'
  }
});

events.on('user/login', (data, meta) => {
  console.log('事件数据:', data);
  console.log('元数据:', meta);  // 包含 type、version 和 environment
});
```

### 事件特定元数据

在发布事件时可以传递额外的元数据，它会与全局元数据合并：

```typescript
const events = new FastEvent({
  meta: { app: 'MyApp' }
});

// 在发布事件时添加特定的元数据
events.emit('order/create', 
  { orderId: '123' },  // 事件数据
  false,  // 不保留
  { timestamp: Date.now() }  // 事件特定的元数据
);

// 监听器接收合并后的元数据
events.on('order/create', (data, meta) => {
  console.log('订单:', data);  // { orderId: '123' }
  console.log('元数据:', meta);  // { type: 'order/create', app: 'MyApp', timestamp: ... }
});
```

## 错误处理

FastEvent 提供了错误处理机制：

```typescript
const events = new FastEvent({
  ignoreErrors: true,  // 默认为 true，不会抛出错误
  onListenerError: (type, error) => {
    console.error(`处理事件 ${type} 时发生错误:`, error);
  }
});

events.on('process', () => {
  throw new Error('处理失败');
});

// 不会抛出错误，而是触发 onListenerError
events.emit('process');
```

## 自定义选项

FastEvent 构造函数支持多个选项：

```typescript
const events = new FastEvent({
  // 事件路径分隔符，默认为 '/'
  delimiter: '.',  
  // 事件处理器的上下文
  context: null,  
  // 元数据，会传递给所有事件处理器
  meta: { version: '1.0' },
  
  // 错误处理
  ignoreErrors: true,
  onListenerError: (type, error) => {
    console.error(`事件错误:`, type, error);
  },
  
  // 监听器添加/移除的回调
  onAddListener: (path, listener) => {
    console.log('添加监听器:', path);
  },
  onRemoveListener: (path, listener) => {
    console.log('移除监听器:', path);
  }
});
```

# 性能

![](./bench.png)