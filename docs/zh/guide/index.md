# 快速开始

## 介绍

FastEvent 是一个强大的 TypeScript 事件管理库，提供灵活的事件订阅和发布机制，支持事件通配符、作用域和异步事件等功能。

与 `EventEmitter2` 相比，`FastEvent` 有以下优势：

-   性能提升约 `1+` 倍
-   体积更小 (`6.3kb` vs `43.4kb`)
-   功能更全面

## 安装

使用 npm 安装：

```bash
npm install fastevent
```

或使用 yarn：

```bash
yarn add fastevent
```

## 基本用法

```typescript
import { FastEvent } from 'fastevent';

// 创建事件实例
const events = new FastEvent();

// 订阅事件
events.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
    console.log('事件类型:', message.type);
    console.log('元数据:', message.meta);
});

// 发布事件 - 方式1: 参数形式
events.emit('user/login', { id: 1, name: '张三' });

// 发布事件 - 方式2: 消息对象形式
events.emit({
    type: 'user/login',
    payload: { id: 1, name: '张三' },
    meta: { timestamp: Date.now() },
});
```

## 类型安全

FastEvent 提供完整的 TypeScript 支持：

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

const events = new FastEvent<MyEvents>();

// TypeScript 会强制类型检查
events.on('user/login', (message) => {
    const { id, name } = message.payload; // 正确的类型推断
});
```

## 下一步

-   了解[事件消息格式](/zh/guide/event-message)
-   探索[事件作用域](/zh/guide/scopes)
-   理解[元数据系统](/zh/guide/metadata)
-   掌握[通配符用法](/zh/guide/wildcards)
