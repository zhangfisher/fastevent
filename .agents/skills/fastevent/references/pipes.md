# FastEvent 管道详解

管道包装监听器函数，提供额外功能。

## 队列管道 (queue)

```typescript
import { queue } from 'fastevent/pipes';

events.on('data/update', handler, {
    pipes: [queue({ size: 10 })]
});
```

将事件放入队列处理，支持：
- `size`: 队列大小，默认 10
- `priority`: 优先级队列

适用于高频事件，避免处理不过来。

## 节流管道 (throttle)

```typescript
import { throttle } from 'fastevent/pipes';

events.on('scroll', handler, {
    pipes: [throttle(100)]  // 100ms 最多执行一次
});
```

在指定时间间隔内最多执行一次。

## 防抖管道 (debounce)

```typescript
import { debounce } from 'fastevent/pipes';

events.on('search', handler, {
    pipes: [debounce(300)]  // 停止触发 300ms 后执行
});
```

等待触发停止一段时间后才执行。

## 超时管道 (timeout)

```typescript
import { timeout } from 'fastevent/pipes';

events.on('data/fetch', asyncHandler, {
    pipes: [timeout(5000)]  // 5 秒超时
});
```

监听器执行超时后自动取消。

## 重试管道 (retry)

```typescript
import { retry } from 'fastevent/pipes';

events.on('api/request', asyncHandler, {
    pipes: [retry({
        times: 3,           // 最多重试 3 次
        delay: 1000,        // 延迟 1 秒
        backoff: 2          // 指数退避
    })]
});
```

监听器失败后自动重试。

## 缓存管道 (memorize)

```typescript
import { memorize } from 'fastevent/pipes';

events.on('expensive/compute', handler, {
    pipes: [memorize({
        ttl: 60000,         // 缓存 60 秒
        key: (msg) => msg.payload.id  // 自定义缓存键
    })]
});
```

缓存监听器执行结果，相同参数直接返回缓存。

## 组合管道

```typescript
import { throttle, debounce, timeout, retry } from 'fastevent/pipes';

events.on('api/search', handler, {
    pipes: [
        debounce(300),
        throttle(1000),
        timeout(5000),
        retry({ times: 3, delay: 1000 })
    ]
});
```

管道按顺序执行，每个包装下一个。

## 自定义管道

```typescript
function myPipe(options: any) {
    return (listener: FastEventListener, message: FastEventMessage) => {
        // 包装前
        console.log('Before:', message);

        const wrapped = async (...args: any[]) => {
            // 执行前
            const result = await listener(...args);
            // 执行后
            return result;
        };

        // 包装后
        return wrapped;
    };
}

events.on('event', handler, {
    pipes: [myPipe({ option: 'value' })]
});
```

## 管道应用场景

| 场景 | 推荐管道 |
|------|---------|
| 搜索输入 | `debounce` + `throttle` |
| API 请求 | `timeout` + `retry` |
| 高频事件 | `queue` |
| 昂贵计算 | `memorize` |
| 表单提交 | `debounce` + `timeout` |
