# FastEvent 执行器详解

执行器控制事件监听器的执行方式和顺序。

## 并行执行 (parallel) - 默认

```typescript
import { parallel } from 'fastevent/executors';

const events = new FastEvent({ executor: parallel() });
// 或默认行为
const events = new FastEvent();
```

所有监听器并发执行，返回所有结果。

## 串行执行 (series)

```typescript
import { series } from 'fastevent/executors';

const events = new FastEvent({ executor: series() });
```

监听器按添加顺序依次执行，返回最后一个结果。某个监听器失败不会中断后续执行。

## 竞速执行 (race)

```typescript
import { race } from 'fastevent/executors';

const events = new FastEvent({ executor: race() });
```

所有监听器并发执行，返回最快完成的结果。适用于：
- 多个数据源竞速
- 缓存与网络请求竞速
- 多个策略竞速

```typescript
events.on('data/fetch', async () => {
    return await fetchFromCache();  // 快速返回
});

events.on('data/fetch', async () => {
    return await fetchFromNetwork();  // 较慢
});

// 返回最快完成的结果
const data = await events.emitAsync('data/fetch');
```

## 瀑布流执行 (waterfall)

```typescript
import { waterfall } from 'fastevent/executors';

const events = new FastEvent({ executor: waterfall() });
```

监听器依次执行，每个监听器接收前一个监听器的返回值作为参数。任何一个失败会中断后续执行。

```typescript
events.on('data/process', (data) => {
    return { ...data, step1: true };
});

events.on('data/process', (data) => {
    // data 包含 step1
    return { ...data, step2: true };
});
```

## 首个执行 (first)

```typescript
import { first } from 'fastevent/executors';

const events = new FastEvent({ executor: first() });
```

只执行第一个监听器。

## 末尾执行 (last)

```typescript
import { last } from 'fastevent/executors';

const events = new FastEvent({ executor: last() });
```

只执行最后一个监听器。

## 随机执行 (random)

```typescript
import { random } from 'fastevent/executors';

const events = new FastEvent({ executor: random() });
```

随机选择一个监听器执行。适用于：
- A/B 测试
- 负载均衡
- 随机策略选择

## 负载均衡 (balance)

```typescript
import { balance } from 'fastevent/executors';

const events = new FastEvent({ executor: balance() });
```

记录每个监听器的执行次数，优先选择执行次数较少的监听器。

## 自定义执行器

```typescript
const events = new FastEvent({
    executor: (listeners, message, args, execute) => {
        // listeners: 可用监听器数组
        // message: 事件消息
        // args: 原始参数
        // execute: 执行单个监听器的函数

        // 自定义逻辑
        const selectedListeners = selectListeners(listeners);
        return selectedListeners.map(l => execute(l));
    }
});
```

## 选择建议

| 场景 | 推荐执行器 |
|------|-----------|
| 默认行为 | `parallel` |
| 数据处理管道 | `waterfall` |
| 缓存竞速 | `race` |
| 顺序执行 | `series` |
| A/B 测试 | `random` |
| 负载均衡 | `balance` |
