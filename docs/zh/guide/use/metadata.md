# 元数据

FastEvent 提供了灵活的元数据机制，允许为事件监听器提供额外的上下文数据，用来传递给事件监听者。

## 全局元数据

在创建`FastEvent`实例时，可以传入`meta`选项来指定全局元数据。

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: {
        source: 'web',
        timeout: 1000,
    },
});
// 监听者接收到的元数据
emitter.on('x', (message, args) => {
    message.meta; // { source: 'web', timeout: 1000 }
    args.meta; //  undefined
});
```

## 自定义元数据

也可以在触发事件时提供额外元数据，该元数据将被合并到事件消息的元数据中。

```typescript
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: {
        source: 'web',
        timeout: 1000,
    },
});
// 监听者接收到的元数据
emitter.on('x', (message, args) => {
    // { source: 'web', timeout: 1000,url: 'https://github.com/zhangfisher/repos' }
    message.meta;
    // { url: 'https://github.com/zhangfisher/repos' }
    args.meta;
});
emitter.emit('x', 1, {
    meta: {
        url: 'https://github.com/zhangfisher/repos',
    },
});
```

## 元数据类型

### 定义元数据类型

```typescript
import { FastEvent } from 'fastevent';

interface AppMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes, AppMeta>();

// 类型检查
emitter.on('user/login', (message, args) => {
    message.meta; // type AppMeta
    args.meta; // undefined
});
```

### 自动推断元数据类型

```typescript
import { FastEvent } from 'fastevent';

interface AppMeta {
    requestId?: string;
    sessionId: string;
    userAgent?: string;
}

const emitter = new FastEvent<EventTypes>({
    meta: {
        requestId: 'xxxxxxxx',
        sessionId: '1234',
        userAgent: 'default',
    },
});

// 类型检查
emitter.on('user/login', (message, args) => {
    message.meta; // type AppMeta
    args.meta; // undefined
});
```
