# 快速入门

本节将帮助你快速上手 FastEvent，了解其核心功能和基本用法。

## 第一步：安装

使用`npm/yarn/pnpm/bun` 安装 FastEvent：

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

## 第二步：创建事件发射器

```typescript
import { FastEvent } from 'fastevent';

// 创建基本事件发射器

// 或创建带类型定义的事件发射器
interface Events {
    'user/login': { userId: string };
    'user/logout': { userId: string };
    'message/new': { content: string };
}

const typedEmitter = new FastEvent<Events>();
```

## 第三步：注册事件监听器

```typescript
// 监听单个事件
emitter.on('user/login', (message) => {
    console.log(`用户登录: ${message.payload.userId}`);
});

// 使用通配符监听多个事件
emitter.on('user/*', (message) => {
    console.log(`用户事件: ${message.type}`);
});

// 监听所有事件
emitter.onAny((message) => {
    console.log(`触发事件: ${message.type}`);
});

// 一次性事件监听
emitter.once('message/new', (message) => {
    console.log(`新消息: ${message.payload.content}`);
});
```

## 第四步：触发事件

```typescript
// 同步触发事件
emitter.emit('user/login', { userId: '123' });

// 同步触发事件,并且配置retain=true
// 保留最后一次事件数据，以便后续订阅者可以接收最后一次事件数据
emitter.emit('user/login', { userId: '123' },true);

// 异步触发事件
await emitter.emitAsync('message/new', { content: 'Hello' });

// 带元数据的事件
emitter.emit('user/login', { userId: '123' }, false, {
    timestamp: Date.now(),
});
```

## 第五步：使用作用域

作用域可以帮助你更好地组织和管理事件：

```typescript
// 创建用户相关事件的作用域
const userScope = emitter.scope('user');

// 在作用域中监听事件（实际监听的是 'user/login'）
userScope.on('login', (message) => {
    console.log(`用户登录: ${message.payload.userId}`);
});

// 在作用域中触发事件
userScope.emit('login', { userId: '123' });

// 创建嵌套作用域
const profileScope = userScope.scope('profile');
profileScope.emit('update', { name: 'John' }); // 实际触发 'user/profile/update'
```

## 第六步：使用事件保留

事件保留功能可以让新的订阅者立即收到最后一次的事件数据：

```typescript
// 触发事件并保留
emitter.emit('system/status', { online: true }, true);

// 之后注册的监听器会立即收到保留的事件数据
emitter.on('system/status', (message) => {
    console.log(`系统状态: ${message.payload.online}`);
});
```

## 第七步：等待事件

使用 waitFor 方法等待特定事件的发生：

```typescript
try {
    // 等待登录事件，最多等待5秒
    const message = await emitter.waitFor('user/login', 5000);
    console.log('用户已登录:', message.payload);
} catch (error) {
    console.log('等待超时');
}
```

## 第八步：清理事件

```typescript
// 移除特定事件的所有监听器
emitter.off('user/login');

// 移除特定作用域下的所有监听器
userScope.offAll();

// 移除所有事件监听器
emitter.offAll();
```

## 类型安全

FastEvent 提供完整的 TypeScript 支持，可以获得完整的类型提示和检查：

```typescript
interface Events {
    'user/login': { userId: string };
    'user/logout': void;
}

const emitter = new FastEvent<Events>();

// 正确的类型
emitter.emit('user/login', { userId: '123' }); // ✅

// 类型错误
emitter.emit('user/login', { userId: 123 }); // ❌ 类型错误
emitter.emit('unknown/event', {}); // ❌ 未定义的事件
```

通过以上步骤，你已经了解了`FastEvent`的基本用法。更多高级特性和详细说明，请参考后续章节。
