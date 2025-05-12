# 执行器


事件触发的本质是调用`emit`方法，`emit`方法会调用所有注册的监听器函数，然后返回所有监听器的执行结果。

正常情况下，`emit`方法会按注册顺序依次调用所有监听器函数，然后返回所有监听器的执行结果。

`FastEvent`提供了灵活的执行器机制，可以让开发者配置如何执行多个监听器、如何处理执行结果，以及如何优化性能。


## 内置执行器

`FastEvent`内置了以下几种执行器：

| 执行器                                    | 描述                                         |
| ----------------------------------------- | -------------------------------------------- |
| `parallel`                                | 默认，并发执行                               |
| `race`                                    | 并行执行器，使用 `Promise.race` 并行执行     |
| `balance`                                 | 平均分配执行器                               |
| `first`                                   | 执行第一个监听器                             |
| `last`                                    | 执行最后一个监听器                           |
| `random`                                  | 随机选择监听器                               |
| `series`                                  | 串行执行器，依次执行监听器并返回最后一个结果 |
| `waterfall`                               | 依次执行监听器并返回最后一个结果,出错时中断  |
| `(listeners,message,args,execute)=>any[]` | 自定义执行器                                 |

## 使用执行器

- **触发事件时指定执行器**

在调用`emit`函数触发事件时指定执行器，仅对当前事件有效。

```typescript
import { race } from "fastevent/executors"   // [!code ++]

const emitter = new FastEvent();

emitter.emit("event",payload,{
    executor: race()   // [!code ++]
})

```

- **全局指定执行器**

在创建事件发射器时指定执行器，对所有事件有效。

```typescript
import { race } from "fastevent/executors"   // [!code ++]

const emitter = new FastEvent({
    executor: race() // [!code ++]
});

emitter.emit("event",payload)

```

## 自定义执行器

除了内置的执行器外，`FastEvent`还支持自定义执行器。

你可以创建自定义执行器来实现特定的执行逻辑。

```typescript
const customExecutor = (listeners, message, args, execute) => {
    // listeners: 监听器数组，每个元素是 [listener, maxCount, executedCount] 的元组
    // message: 事件消息
    // args: 额外参数
    // execute: 执行单个监听器的函数

    // 示例：只执行第一个监听器
    return [execute(listeners[0][0], message, args)];
};

const emitter = new FastEvent({
    executor: customExecutor,
});
```

### 执行次数管理

每个监听器在 FastEvent 中都以元组形式存储：`[listener, maxCount, executedCount]`

-   `listener`: 监听器函数
-   `maxCount`: 最大执行次数限制（0 表示无限制）
-   `executedCount`: 已执行次数

**重点说明：**

默认情况下，监听器的执行次数是自动管理的，你不需要手动修改。
每次执行监听器后，`FastEvent`会自动减少所有监听器的`executedCount`。

但是在有些监听器中，并不是所有监听器都需要执行，比如`race`和`balance`执行器，只会从监听器数组中选择一个监听函数执行。
这就会导致监听器的执行次数与预期不符。

因此，就需要执行器修正此问题来保证`executedCount`值的正确性。

以`random`执行器为例，会从监听器列表中随机选取一个执行。

执行监听器的伪代码如下：

```ts
class FastEvent {
    _executeListeners(listeners, message, args, execute) {
        try {
            executor(listeners, message, args, execute);
        } finally {
            // 所有监听器的执行次数都会+1
            // listener = [listener,maxCount,executedCount]
            listeners.forEach((listener) => {
                listener[2]++; //   [!code ++]
            });
        }
    }
}
```

而`random`执行器只会从监听器列表中随机选取一个执行，因此需要手动修正监听器的执行次数。

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    // 所有监听器执行次数都会-1，以抵消后续的+1
    listeners.forEach((listener) => listener[2]--); //   [!code ++]
    // 只有被选中的监听器执行次数+1
    listeners[index][2]++; //   [!code ++]
    return [execute(listeners[index][0], message, args)];
};
```

### 为什么要使用 execute 函数

创建自定义监听函数执行器时，需要使用`execute`函数来执行监听器函数。

以`random`执行器为例，`execute`函数用于执行监听器函数。

```typescript
export const random = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length);
    listeners.forEach((listener) => listener[2]--);
    listeners[index][2]++;
    // ❌直接执行监听器函数: 无法保证监听器函数上下文this的准确性和错误处理
    return [listeners[index][0](message, args)];
    // ✅使用execute执行监听器函数
    return [execute(listeners[index][0], message, args)];
};
```

:::warning 提示
可以参考内置执行器的代码实现，编写自己的执行器，见[这里](https://github.com/zhangfisher/fastevent/tree/master/packages/native/src/executors)
:::