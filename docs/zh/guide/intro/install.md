# 安装

## 使用包管理器

::: code-group

```bash [npm]
npm install fastevent
```

```bash [yarn]
yarn add fastevent
```

```bash [pnpm]
pnpm add fastevent
```

```bash [bun]
bun add fastevent
```

:::

## TypeScript 支持

FastEvent 使用 TypeScript 编写，提供完整的类型定义，无需额外安装类型文件。

## 导入方式

::: code-group

```typescript [ESM]
import { FastEvent } from 'fastevent';
```

```javascript [CommonJS]
const { FastEvent } = require('fastevent');
```

:::

## 开发环境

如果你想使用开发工具（如 Redux DevTools）来调试事件流，可以安装开发工具包：

```bash
npm install --save-dev @fastevent/devtools
```

然后在你的代码中启用它：

```typescript
import { install } from '@fastevent/devtools';

// 启用开发工具
install();

// 创建事件发射器时启用调试模式
const emitter = new FastEvent({ debug: true });
```

## 生产环境优化

在生产环境中，建议关闭调试模式以获得更好的性能：

```typescript
const emitter = new FastEvent({
    debug: process.env.NODE_ENV !== 'production',
});
```

## 浏览器直接使用

你也可以通过 CDN 直接在浏览器中使用 FastEvent：

```html
<script src="https://unpkg.com/fastevent"></script>
```

然后通过全局变量访问：

```javascript
const emitter = new FastEvent();
```

## 版本说明

-   确保你使用的是最新的稳定版本
-   查看[更新日志](../changelog.md)了解各版本的变化
-   不同版本之间可能存在破坏性更改，升级时请注意查看相关说明

## 下一步

-   阅读[快速开始](./get-started.md)了解基本用法
-   查看[API 文档](../api/)了解详细功能
-   参考[最佳实践](../guide/best-practices.md)了解使用建议
