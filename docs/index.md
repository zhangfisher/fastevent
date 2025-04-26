# FastEvent Documentation

FastEvent is a powerful TypeScript event management library that provides flexible event subscription and publishing mechanisms.

## Features

-   🚀 High performance event system
-   🔍 Support for event wildcards
-   🏗️ Hierarchical event scopes
-   📦 Small package size (~6.3kb)
-   🛠️ TypeScript support
-   📝 Metadata system

## Quick Links

-   [Getting Started](/guide/)
-   [API Reference](/api/)
-   [GitHub Repository](https://github.com/your-username/fastevent)

```typescript
// Quick example
import { FastEvent } from 'fastevent';

const events = new FastEvent();

events.on('user/login', (message) => {
    console.log('User logged in:', message.payload);
});

events.emit('user/login', { id: 1, name: 'Alice' });
```

1. ⚡ 高性能 - 比 EventEmitter2 快 1 倍以上，体积仅 6.3kb
2. 🔍 通配符支持 - 强大的单级(\*)和多级(\*\*)通配符匹配
3. 🏗️ 层级作用域 - 嵌套作用域管理，自动路径前缀
4. 🔄 异步事件 - 原生支持 async/await 事件处理
5. 📝 元数据系统 - 全局/作用域/事件级别的元数据合并
6. 💾 保留消息 - 事件持久化，新订阅者自动获取
7. 🛠️ 完整 TypeScript 支持 - 严格类型检查，自动补全
8. 🔧 事件钩子 - 监听器生命周期监控和调试
9. 🌐 多平台 - 支持 Node.js、浏览器和主流框架
