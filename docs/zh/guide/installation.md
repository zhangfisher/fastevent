# 安装指南

FastEvent 可以通过多种包管理工具安装，并集成到不同类型的项目中。

## 包管理器

### npm

```bash
npm install fastevent
```

### yarn

```bash
yarn add fastevent
```

### pnpm

```bash
pnpm add fastevent
```

## 模块格式

FastEvent 支持多种模块格式：

### ESM (ECMAScript 模块)

```typescript
import { FastEvent } from 'fastevent';
```

### CommonJS

```javascript
const { FastEvent } = require('fastevent');
```

## 开发工具

### 调试模式

要启用调试模式并使用 Redux DevTools：

```typescript
import 'fastevent/devtools';

const events = new FastEvent({
    debug: true,
});
```

确保浏览器中安装了 [Redux DevTools 扩展](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)。

## TypeScript 配置

FastEvent 使用 TypeScript 编写并包含类型定义，无需额外设置。

```json
{
    "compilerOptions": {
        "target": "ES2015",
        "module": "ESNext"
        // ... 其他选项
    }
}
```

## 基本设置

### 创建实例

```typescript
import { FastEvent } from 'fastevent';

// 基本实例
const events = new FastEvent();

// 带配置的实例
const configuredEvents = new FastEvent({
    delimiter: '/',
    debug: process.env.NODE_ENV !== 'production',
    meta: {
        version: '1.0',
        environment: process.env.NODE_ENV,
    },
});
```

### 类型安全

```typescript
interface MyEvents {
    'user/login': { id: number; name: string };
    'user/logout': { id: number };
}

interface MyMeta {
    timestamp: number;
    source?: string;
}

const events = new FastEvent<MyEvents, MyMeta>();
```

## 框架集成

### React

```typescript
// events.ts
import { FastEvent } from 'fastevent';

export const events = new FastEvent();

// App.tsx
import { events } from './events';
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        const handler = (message) => {
            console.log('收到事件:', message);
        };

        events.on('user/login', handler);
        return () => events.off('user/login', handler);
    }, []);
}
```

### Vue

```typescript
// events.ts
import { FastEvent } from 'fastevent';

export const events = new FastEvent();

// Component.vue
import { events } from './events';
import { onMounted, onUnmounted } from 'vue';

export default {
    setup() {
        const handler = (message) => {
            console.log('收到事件:', message);
        };

        onMounted(() => {
            events.on('user/login', handler);
        });

        onUnmounted(() => {
            events.off('user/login', handler);
        });
    },
};
```

## 环境考虑

### 生产环境

生产环境配置：

```typescript
const events = new FastEvent({
    debug: false,
    ignoreErrors: true,
    onListenerError: (type, error) => {
        // 记录到错误跟踪服务
        errorTracker.log(error);
    },
});
```

### 开发环境

开发环境配置：

```typescript
const events = new FastEvent({
    debug: true,
    ignoreErrors: false,
    onListenerError: (type, error) => {
        console.error(`事件 ${type} 错误:`, error);
    },
    onExecuteListener: (message, returns, listeners) => {
        console.log(`事件执行:`, {
            type: message.type,
            listeners: listeners.length,
            returns,
        });
    },
});
```

## 最佳实践

1. **实例管理**：

    - 为应用创建单一实例
    - 从中心位置导出实例
    - 考虑使用依赖注入

2. **类型安全**：

    - 尽早定义事件接口
    - 使用 TypeScript 获得更好的开发体验
    - 文档化事件类型

3. **调试模式**：

    - 开发时启用
    - 生产环境禁用
    - 使用 DevTools 调试

4. **错误处理**：
    - 配置错误处理器
    - 适当记录错误
    - 考虑环境差异
