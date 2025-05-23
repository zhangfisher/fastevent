# 概述

FastEvent 是一个功能强大、类型安全的事件库，专为现代 JavaScript/TypeScript 应用设计。它提供了灵活的事件处理机制，支持命名空间、作用域隔离、事件保留等高级特性，让事件驱动编程变得简单而优雅。

## 为什么选择 FastEvent？

FastEvent 不仅仅是一个普通的事件发射器，它是一个全面的事件管理解决方案：

-   类型安全：完整的 TypeScript 支持，提供精确的类型推导
-   高性能：优化的事件分发机制，最小化性能开销
-   灵活性：支持多种事件模式，适应不同的应用场景
-   可靠性：完善的错误处理和调试支持

## 核心特性

🚀 **完整的 TypeScript 支持**：提供完整的类型定义和类型推导，让代码更安全可靠

🌳 **层级化事件系统**：支持使用分隔符（如'/'）创建事件层级，便于组织和管理

🎯 **作用域隔离**：通过 scope API 创建独立的事件作用域，实现模块化事件管理

🔄 **事件保留机制**：支持保留最后一次事件，新订阅者可以立即获得最新状态

🌟 **灵活的通配符**：支持单层（\*）和多层（\*\*）通配符，实现灵活的事件匹配

🛡️ **错误处理机制**：提供完善的错误捕获和处理选项，增强应用稳定性

⚡ **同步/异步支持**：支持同步和异步事件触发，满足不同场景需求

🎨 **元数据扩展**：支持为事件添加自定义元数据，提供更丰富的上下文信息

🔍 **调试友好**：内置调试模式，帮助开发者追踪事件流转

🎮 **上下文控制**：支持自定义事件处理器的执行上下文，灵活控制 this 指向

📦 **轻量级设计**：核心功能零依赖，打包体积小，适合各种项目

🔌 **插件化架构**：提供钩子机制，支持功能扩展和自定义行为

🎭 **多种订阅模式**：支持一次性订阅、计数订阅等多种订阅方式

⏳ **超时控制**：支持等待事件时设置超时时间，避免无限等待

🔗 **链式调用**：支持方法链式调用，提供流畅的 API 体验

## 快速开始

```typescript
import { FastEvent } from 'fastevent';

// 创建事件发射器
const emitter = new FastEvent();

// 监听事件
emitter.on('user/login', (message) => {
    console.log(`用户登录: ${message.payload}`);
});

// 创建作用域
const userScope = emitter.scope('user');
userScope.on('logout', (message) => {
    console.log(`用户登出: ${message.payload}`);
});

// 触发事件
emitter.emit('user/login', { userId: 123 });
userScope.emit('logout', { userId: 123 });
```

FastEvent 让事件驱动编程变得简单而强大，无论是小型项目还是大型应用，都能轻松应对各种事件处理需求。
