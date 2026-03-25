---
name: fastevent
description: FastEvent 事件发射器库使用指南。功能强大、类型安全的事件系统，支持层级事件、通配符、执行器、管道等高级特性。
---

# FastEvent 技能

功能强大、类型安全的事件发射器库，支持 Node.js 和浏览器环境。

## 快速开始

```typescript
import { FastEvent } from 'fastevent';
const events = new FastEvent();

// 订阅事件
events.on('user/login', (message) => {
    console.log(message.payload); // { id: 1 }
});

// 发布事件
events.emit('user/login', { id: 1 });
```

## 核心概念

### 事件消息结构

监听器接收 `Message` 对象：
```typescript
{
    type: string,      // 事件名称
    payload: any,      // 事件数据
    meta: object       // 元数据（version, timestamp 等）
}
```

### 层级事件与通配符

支持 `/` 分隔的层级事件：
- `*` - 匹配单级（如 `user/*` 匹配 `user/login`）
- `**` - 匹配多级（如 `user/**` 匹配 `user/login`, `user/profile/update`）

```typescript
events.on('user/*/login', handler);  // 匹配 user/admin/login
events.on('user/**', handler);       // 匹配 user 下所有事件
```

### 执行器（Executors）

控制监听器执行方式：
- `parallel()` - 并行执行（默认）
- `series()` - 串行执行
- `race()` - 竞速，返回最快结果
- `waterfall()` - 瀑布流，结果传递
- `first/last/random/balance()` - 其他策略

```typescript
import { series } from 'fastevent/executors';
const events = new FastEvent({ executor: series() });
```

### 管道（Pipes）

包装监听器实现额外功能：
- `queue()` - 队列处理
- `throttle()` - 节流
- `debounce()` - 防抖
- `timeout()` - 超时
- `retry()` - 重试
- `memorize()` - 缓存

```typescript
import { throttle } from 'fastevent/pipes';
events.on('data/update', handler, { pipes: [throttle(1000)] });
```

### 作用域（Scope）

共享父级监听器表，添加前缀：
```typescript
const userScope = events.scope('user');
userScope.on('login', handler);  // 等同于 events.on('user/login', handler)
```

### 保留事件（Retain）

新订阅者立即接收保留的事件值：
```typescript
events.emit('config/theme', { dark: true }, { retain: true });
// 后续订阅者立即收到 { dark: true }
```

## 类型安全

完整 TypeScript 支持：
```typescript
interface MyEvents {
    'user/login': { id: number };
    'data/update': { value: string };
}
const events = new FastEvent<MyEvents>();
events.emit('user/login', { id: 1 });  // 类型检查
```

## 常用操作

```typescript
// 等待事件
await events.waitFor('user/login', 5000);

// 一次性监听
events.once('startup', handler);

// 移除监听器
const subscriber = events.on('event', handler);
subscriber.off();

// 全局监听
events.onAny((message) => console.log(message.type));

// 清除监听器
events.off('event');
events.offAll();
```

## 详细文档

- `references/advanced-patterns.md` - 高级模式和最佳实践
- `references/executors.md` - 执行器详解
- `references/pipes.md` - 管道详解
- `references/testing.md` - 测试指南

## 项目位置

- 核心代码：[packages/native/src/](../../packages/native/src/)
- 类型定义：[packages/native/src/types/](../../packages/native/src/types/)
- 测试：[packages/native/src/__tests__/](../../packages/native/src/__tests__/)
