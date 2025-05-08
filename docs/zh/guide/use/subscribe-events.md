# 订阅事件

FastEvent 提供了强大而灵活的事件订阅系统，支持多种订阅方式和匹配模式。你可以使用简单的 API 来监听特定事件、一次性事件或所有事件，还可以使用通配符来匹配多个事件。

## 快速入门

### 基本订阅

```typescript
import { FastEvent } from '@fastevent/core';

const event = new FastEvent();

// 订阅特定事件
event.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
});

// 发送事件
event.emit('user/login', { userId: 123 });
```

### 一次性订阅

```typescript
// 只监听一次事件
event.once('notification', (message) => {
    console.log('收到通知:', message.payload);
});
```

### 使用通配符

```typescript
// 监听所有user相关事件
event.on('user/*', (message) => {
    console.log('用户事件:', message.type, message.payload);
});

// 监听所有事件
event.onAny((message) => {
    console.log('全局事件:', message.type, message.payload);
});
```

## 指南

### 事件监听器

订阅事件时需要提供一个事件监听器用于接收事件消息，事件监听器函数签名如下：

```ts
type FastEventListener = (
    message: FastEventMessage, // 事件消息
    args: FastEventListenerArgs, // 事件消息参数
) => any | Promise<any>;
```

-   `FastEventListener`是一个普通的函数类型,可以是同步或异步函数，接收一个事件消息对象作为参数，返回值可以是任意类型。

#### context (执行上下文)

监听器的 `this` 上下文默认指向`FastEvent`实例。

```typescript
const emitter = new FastEvent();
emitter.on('event', function (this, message, args) {
    this === emitter; // true // [!code ++]
});
```

可以在创建`FastEvent`实例时指定`context`属性覆盖默认上下文：

```typescript
const emitter = new FastEvent(
    context: 100
);
emitter.on('event', function (this, message, args) {
    this === 100; // true // [!code ++]
});
```

#### 事件消息格式

FastEvent 使用标准化的消息格式处理所有事件，确保一致性和可扩展性。

所有事件监听器都会接收到一个标准格式的消息对象`FastEventMessage`：

```typescript
interface FastEventMessage<T = string, P = any, M = Record<string, unknown>> {
    type: T; // 事件类型标识符
    payload: P; // 事件携带的数据
    meta: M; // 事件元数据
}
```

-   **字段详解**

| 字段      | 类型                      | 描述           |
| --------- | ------------------------- | -------------- |
| `type`    | `string`                  | 事件名称       |
| `payload` | `any`                     | 事件携带的数据 |
| `meta`    | `Record<string, unknown>` | 事件元数据     |

-   **消息扩展**

`FastEvent`使用`FastEventMessage`作为消息对象，你可以使用`FastEventMessageExtends`接口来扩展消息对象。

`FaseEventMessageExtend`接口用于扩展消息对象，你可以使用它来添加自定义字段：

```typescript
declare module 'fast-event' {
    interface FastEventMessageExtends {
        // 自定义字段
    }
}
```

#### 监听参数

`FastEvent`支持在订阅时传递参数，这些参数会被传递给监听器并用来控制监听器的行为。

```typescript twoslash
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();
// @noErrors
emitter.on(
    'event',
    (message, args) => {
        //    ^^^^
    },
    {
        // 事件监听器参数
    },
);
```

`args`是一个对象，包含以下字段：

```ts
type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Record<string, any> & Partial<M>;
    abortSignal?: AbortSignal; // 用于传递给监听器函数
    executor?: FastListenerExecutorArgs;
};
```

### 订阅方法

#### 基本订阅 - on

`on()`方法是最基本的订阅方法，用于监听指定类型的事件。

```typescript
event.on(type, listener, options?);
```

参数说明：

-   `type`: 事件类型，支持以下格式：
    -   普通字符串：`'user/login'`
    -   单层通配符：`'user/*'`（匹配一层）
    -   多层通配符：`'user/**'`（匹配多层）
    -   全局监听：`'**'`
-   `listener`: 事件监听器函数，接收事件消息对象
-   `options`: 可选的配置项
    -   `count`: 触发次数限制，0 表示无限制
    -   `prepend`: 是否将监听器添加到监听器队列开头
    -   `filter`: 事件过滤函数

```typescript
// 基本使用
event.on('chat/message', (message) => {
    console.log('收到消息:', message.payload);
});

// 使用配置项
event.on(
    'user/login',
    (message) => {
        console.log('用户登录:', message.payload);
    },
    {
        count: 3, // 只触发3次
        prepend: true, // 添加到监听器队列开头
    },
);

// 使用过滤器
event.on(
    'data/update',
    (message) => {
        console.log('数据更新:', message.payload);
    },
    {
        filter: (message) => message.payload.important === true,
    },
);
```

#### 一次性订阅 - once

`once()`方法用于创建只触发一次的事件监听器。这是`on()`方法的特例，相当于设置`options.count = 1`。

```typescript
event.once('server/start', (message) => {
    console.log('服务器启动:', message.payload);
});
```

#### 订阅所有事件 - onAny

`onAny()`方法用于监听所有事件，是`on('**')`的简写形式。

```typescript
event.onAny((message) => {
    console.log('事件类型:', message.type);
    console.log('事件数据:', message.payload);
});
```

### 默认监听器

使用`on/once/onAny`方法订阅事件时，也要可以不指定监听器函数，这时会使用默认的监听器`onMessage`。

```typescript
const emitter = new FastEvent();
// 默认监听器
emitter.onMessage = (message) => {
    console.log('收到事件:', message.type);
};
// 订阅事件到默认监听器
emitter.on('user/login');
emitter.once('user/logout');
emitter.onAny();
```

`onMessage`一般更多地用于类继承时使用，如下：

```ts
class MyEmitter extends FastEvent {
    onMessage(message) {
        console.log('收到事件:', message.type);
    }
}
const emitter = new MyEmitter();
// 订阅事件到默认监听器
emitter.on('user/login');
emitter.once('user/logout');
emitter.onAny();
```

### 通配符匹配

FastEvent 支持两种类型的通配符：

1. **单层通配符（`*`）：匹配单层路径**

```typescript
// 匹配 user/login, user/logout 等
event.on('user/*', (message) => {
    console.log('用户操作:', message.type);
});
```

2. **多层通配符（\*\*）：匹配多层路径**

```typescript
// 匹配 user/profile/update, user/settings/theme/change 等
event.on('user/**', (message) => {
    console.log('用户相关事件:', message.type);
});
```

`**`可以匹配任意数量的路径层级，但是**只能在事件名称的最后面有效**。

```typescript
event.on('user/**', listener); // ✅ 正确
event.on('user/**/login', listener); // ❌ 无效
```

### 事件保留

`FastEvent`支持事件保留`retain`功能，新的订阅者可以立即收到最后一次保留的事件：

```typescript
// 发送事件并保留
event.emit('status/update', { online: true }, true); // 第三个参数true表示保留事件

event.emit(
    'status/update',
    { online: true },
    {
        retain: true, // 保留事件 [!code ++]
    },
);

// 之后的订阅者会立即收到保留的事件
event.on('status/update', (message) => {
    console.log('当前状态:', message.payload); // 立即输出: 当前状态: { online: true }
});
```

### 订阅次数

`FastEvent`支持`count`参数来限制监听器的执行次数，当达到订阅次数后，事件会自动取消订阅：

```ts
event.on('status/update', listener, { count: 3 }); // 只触发3次
```

:::warning 提示
`event.once`是`on()`的特例，相当于`on(event,listener,{count:1})`
:::

### 监听优先级

默认情况下，监听器按照订阅顺序依次放入队列，你可以通过`prepend`参数来将监听器插入队列头部：

```ts
event.on('event', () => 1); // 默认插入队列尾部
event.on('event', () => 2, { prepend: true }); // 插入队列头部

event.emit('event'); // 输出: 2 1
```

### 事件过滤

`FastEvent`支持`filter`参数来过滤事件，只有通过过滤的事件才会被触发：

```ts
event.on('event', (message) => {}, {
    filter: (message, args) => message.payload.userId === '123',
});
```

### 类型安全

FastEvent 完全支持 TypeScript，你可以定义事件类型来获得完整的类型检查：

```typescript
interface MyEvents {
    'user/login': { userId: string; timestamp: number };
    'user/logout': { userId: string };
}

const event = new FastEvent<MyEvents>();

// 类型安全的事件订阅
event.on('user/login', (message) => {
    // message.payload 的类型为 { userId: string; timestamp: number }
    console.log(`用户 ${message.payload.userId} 在 ${message.payload.timestamp} 登录`);
});
```
