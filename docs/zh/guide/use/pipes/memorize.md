# Memorize

用于缓存监听器的执行结果，对于相同的输入直接返回缓存的结果，避免重复计算。

## 使用方法

```typescript
import { memorize } from 'fastevent/pipes'; // [!code ++]
emitter.on(
    'calculate',
    (msg) => {
        return expensiveCalculation(msg.payload);
    },
    {
        pipes: [memorize()],// [!code ++]
    },
);
```

## 自定义缓存逻辑

```ts
import { memorize } from 'fastevent/pipes'; // [!code ++]

let counter = 0
const mockFn = vi.fn().mockImplementation(() => ++counter)
const predicate = vi.fn().mockImplementation((message) => message.payload === 'use-cache')

emitter.on('test', mockFn, {
    pipes: [memorize(predicate)]
})

// 第一次调用，直接执行
const [promise1] = emitter.emit('test', 'use-cache')
const result1 = await promise1

// 第二次调用，predicate返回true，应该使用缓存
const [promise2] = emitter.emit('test', 'use-cache')
const result2 = await promise2

// 第三次调用，predicate返回false，不应该使用缓存
const [promise3] = emitter.emit('test', 'no-cache')
const result3 = await promise3

expect(result1).toBe(1)
expect(result2).toBe(1) // 使用缓存
expect(result3).toBe(2) // 重新执行
expect(mockFn).toHaveBeenCalledTimes(2)
expect(predicate).toHaveBeenCalledTimes(2)
```


:::warning 提示
默认情况下，`memorize`是根据`payload`来判断是否使用缓存。
:::