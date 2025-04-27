# FastEvent 文档

FastEvent 是一个强大的 TypeScript 事件管理库，提供灵活的事件订阅和发布机制。

## 特性

-   🚀 高性能事件系统
-   🔍 支持事件通配符
-   🏗️ 层级化事件作用域
-   📦 小巧的体积 (~6.3kb)
-   🛠️ TypeScript 支持
-   📝 元数据系统

## 快速链接

-   [快速开始](/zh/guide/)
-   [API 参考](/zh/api/)
-   [GitHub 仓库](https://github.com/zhangfisher/fastevent)

```typescript
// 简单示例
import { FastEvent } from 'fastevent';

const events = new FastEvent();

events.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
});

events.emit('user/login', { id: 1, name: '张三' });
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
