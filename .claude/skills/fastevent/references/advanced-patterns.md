# FastEvent 高级模式

## 事件转发

将特定事件转发到另一个 FastEvent 实例：

```typescript
const otherEmitter = new FastEvent();
const emitter = new FastEvent({
    onAddListener: (type, listener, options) => {
        // 订阅转发：@/ 开头的事件转发到 otherEmitter
        if (type.startsWith('@/')) {
            return otherEmitter.on(type.substring(2), listener, options);
        }
    },
    onBeforeExecuteListener: (message, args) => {
        // 发布转发
        if (message.type.startsWith('@/')) {
            message.type = message.type.substring(2);
            return otherEmitter.emit(message, args);
        }
    },
});
```

## 元数据（Meta）

多层级元数据合并：

```typescript
const events = new FastEvent({
    meta: { version: '1.0', environment: 'production' }
});

const userScope = events.scope('user', {
    meta: { domain: 'user' }
});

userScope.emit('login', { userId: '123' }, {
    meta: { timestamp: Date.now() }
});

// 监听器接收合并后的 meta：
// { version: '1.0', environment: 'production', domain: 'user', timestamp: ..., type: 'user/login' }
```

## Hooks 生命周期钩子

```typescript
const events = new FastEvent({
    onAddListener: (type, listener, options) => {
        console.log('添加监听器:', type);
        // 返回 false 阻止添加
        // 返回 FastEventSubscriber 自定义订阅
    },
    onRemoveListener: (type, listener) => {
        console.log('移除监听器:', type);
    },
    onClearListeners: () => {
        console.log('清除所有监听器');
    },
    onListenerError: (error, listener, message, args) => {
        console.error('监听器错误:', error);
    },
    onBeforeExecuteListener: (message, args) => {
        // 返回 false 阻止执行
    },
    onAfterExecuteListener: (message, returns, listeners) => {
        // 可拦截修改返回值
    },
});
```

## 监听器选项

```typescript
events.on('event', handler, {
    count: 3,           // 最多触发 3 次
    prepend: true,      // 添加到队列开头
    filter: (msg) => msg.payload.important,  // 过滤条件
    pipes: [...],       // 应用管道
});
```

## 异步迭代器

```typescript
const iterator = events.toIterator('data/update', {
    signal: abortController.signal
});

for await (const message of iterator) {
    console.log(message.payload);
}
```

## 错误处理

`emitAsync` 使用 `Promise.allSettled`，不会因单个监听器失败而中断：

```typescript
const results = await events.emitAsync('event', data);
results.forEach(result => {
    if (result.status === 'rejected') {
        console.error('监听器失败:', result.reason);
    }
});
```

## EventBus 模式

使用 EventBus 实现跨组件通信：

```typescript
import { EventBus } from 'fastevent/eventbus';

// 创建全局事件总线
export const eventBus = new EventBus();

// 组件 A 中发送
eventBus.emit('user/updated', user);

// 组件 B 中接收
eventBus.on('user/updated', handler);
```
