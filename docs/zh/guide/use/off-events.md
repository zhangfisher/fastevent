# 取消订阅事件

`FastEvent`提供了灵活的事件取消订阅机制，支持多种取消方式。你可以取消特定事件的订阅、特定监听器的订阅，或者取消所有订阅。同时，还支持按作用域清理订阅，以及清除保留的事件。

## 快速入门

### 使用订阅对象取消

```typescript
// 订阅事件时保存返回的订阅对象
const subscriber = event.on('user/login', (message) => {
    console.log('用户登录:', message.payload);
});

// 使用订阅对象取消订阅
subscriber.off();
```

:::warning 推荐
推荐使用订阅对象取消订阅，可以避免误操作
:::

### 使用 off 方法取消

```typescript
const listener = (message) => {
    console.log('收到消息:', message.payload);
};

// 订阅事件
event.on('chat/message', listener);

// 取消特定事件的特定监听器
event.off('chat/message', listener);
```

### 取消所有订阅

```typescript
// 取消所有事件订阅
event.offAll();
```

## 指南

### 订阅器

`on/once/onAny`方法会返回一个订阅对象:

```ts
export type FastEventSubscriber = {
    off: () => void;
    listener: FastEventListener<any, any, any>;
};
```

推荐采用订阅对象取消订阅，可以避免误操作：

```ts
const subscriber = event.on('chat/message', listener);
subscriber.off(); // [!code ++]
```

### off 方法

`off()`方法是最基本的取消订阅方法，支持多种调用方式：

1. **取消特定事件的特定监听器：**

```typescript
const subscriber = event.on('chat/message', listener);
event.off('chat/message', subscriber.listener);
```

**特别注意：**
以上方法有时可能如预期取消订阅，因为内部有可能会对`listener`函数进行二次包装，因此`off()`方法可能无法取消订阅。
优先采用以下方式进行退订：

```ts
const subscriber = event.on('chat/message', listener);
subscriber.off(); // [!code ++]
```

也可以使用以下方法：

```
const subscriber = event.on('chat/message', listener);
event.off('chat/message',
    subscriber.listener // [!code ++]
);
```

2. **取消特定事件的所有监听器：**

```typescript
event.off('chat/message');
```

3. **取消特定监听器的所有事件订阅：**

```typescript
event.off(listener);
```

### offAll 方法

`offAll()`方法用于批量取消订阅，支持可选的前缀参数：

1. 取消所有事件订阅：

```typescript
event.offAll();
```

2. 取消特定前缀的所有事件订阅：

```typescript
// 取消所有以'user/'开头的事件订阅
event.offAll('user');
```

特性说明：

-   会清除指定范围内的所有监听器
-   不会影响其他范围的监听器
-   适合批量清理特定模块或功能的事件订阅

### clear 方法

`clear()`方法不仅会取消订阅，还会清除保留的事件：

```typescript
// 清除所有订阅和保留的事件
event.clear();

// 清除特定前缀的订阅和保留的事件
event.clear('user');
```

特性说明：

-   同时清除订阅和保留的事件
-   支持按前缀清除
-   适合完全重置特定范围的事件系统

:::warning 提示
`clear`和`offAll`的区别在于,`clear`会清除保留的事件消息,而`offAll`不会.
:::

### 自动取消订阅

`FastEvent`支持在订阅时指定`off`参数，用于在接收到满足条件的消息时自动取消订阅。

```ts
import { FastEvent } from 'fastevent';

const emitter = new FastEvent();

emitter.on(
    'click',
    (message, args) => {
        console.log(message);
    },
    {
        off: (message, args) => {
            return message.payload === 'exit'; //   [!code++]
        },
    },
);
emitter.emit('click', '1');
emitter.emit('click', 'exit');
```

-   以上示例将在接收到`payload=exit`消息时自动取消订阅。
