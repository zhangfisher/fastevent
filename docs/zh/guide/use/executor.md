# 执行器

`FastEvent`提供了灵活的执行器机制，用于控制事件监听器的执行方式。执行器可以决定如何执行多个监听器、如何处理执行结果，以及如何优化性能。

## 内置执行器

### default（默认执行器）

执行所有注册的监听器，并返回所有结果。

```typescript
const emitter = new FastEvent({
    executor: 'default', // 或省略，这是默认值
});

emitter.on('test', () => 'result1');
emitter.on('test', () => 'result2');

const results = emitter.emit('test');
console.log(results); // ['result1', 'result2']
```

### race（竞速执行器）

只返回最快完成的监听器结果，特别适合处理异步操作。

```typescript
const emitter = new FastEvent({
    executor: 'race',
});

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'slow';
});

emitter.on('test', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return 'fast';
});

const results = await emitter.emitAsync('test');
console.log(results); // ['fast']
```

### balance（负载均衡执行器）

在多次触发事件时，平均分配执行次数给所有监听器。

```typescript
const emitter = new FastEvent({
    executor: 'balance',
});

emitter.on('test', () => 'handler1');
emitter.on('test', () => 'handler2');
emitter.on('test', () => 'handler3');

// 每个监听器会被大致平均调用
for (let i = 0; i < 9; i++) {
    emitter.emit('test');
}
```

### first（首个执行器）

只执行第一个注册的监听器。

```typescript
const emitter = new FastEvent({
    executor: 'first',
});

emitter.on('test', () => '第一个');
emitter.on('test', () => '第二个');

const results = emitter.emit('test');
console.log(results); // ['第一个']
```

### last（最后执行器）

只执行最后一个注册的监听器。

```typescript
const emitter = new FastEvent({
    executor: 'last',
});

emitter.on('test', () => '第一个');
emitter.on('test', () => '最后一个');

const results = emitter.emit('test');
console.log(results); // ['最后一个']
```

### random（随机执行器）

随机选择一个监听器执行。

```typescript
const emitter = new FastEvent({
    executor: 'random',
});

emitter.on('test', () => '监听器1');
emitter.on('test', () => '监听器2');
emitter.on('test', () => '监听器3');

// 每次执行会随机选择一个监听器
const results = emitter.emit('test');
console.log(results); // 随机返回 ['监听器1'] 或 ['监听器2'] 或 ['监听器3']
```

## 配置级别

FastEvent 提供了三个级别的执行器配置：

### 1. 全局配置

在创建 FastEvent 实例时配置，将应用于所有事件。

```typescript
const emitter = new FastEvent({
    executor: 'race', // 全局使用race执行器
});
```

### 2. Scope 配置

在创建作用域时配置，将覆盖全局配置。

```typescript
const emitter = new FastEvent({
    executor: 'default',
});

const scope = emitter.scope('test', {
    executor: 'race', // 此作用域下使用race执行器
});
```

### 3. 事件触发时配置

在触发事件时指定，优先级最高。

```typescript
const emitter = new FastEvent({
    executor: 'default',
});

// 仅此次触发使用race执行器
emitter.emit('test', data, {
    executor: 'race',
});
```

## 自定义执行器

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

## 实际应用场景

### 1. 异步操作竞速

使用 race 执行器处理多个数据源，采用最快的响应。

```typescript
const emitter = new FastEvent({
    executor: 'race',
});

// 注册多个数据源处理器
emitter.on('getData', async () => {
    const data = await primaryDB.query();
    return data;
});

emitter.on('getData', async () => {
    const data = await backupDB.query();
    return data;
});

// 获取最快返回的数据
const result = await emitter.emitAsync('getData');
```

### 2. 负载均衡

使用 balance 执行器在多个处理器之间分配任务。

```typescript
const emitter = new FastEvent({
    executor: 'balance',
});

// 注册多个工作处理器
emitter.on('processTask', (task) => {
    return worker1.process(task);
});

emitter.on('processTask', (task) => {
    return worker2.process(task);
});

// 任务会被平均分配给不同的处理器
tasks.forEach((task) => {
    emitter.emit('processTask', task);
});
```

### 3. 降级处理

使用自定义执行器实现服务降级。

```typescript
const fallbackExecutor = (listeners, message, args, execute) => {
    // 尝试主要处理器
    try {
        return [execute(listeners[0][0], message, args)];
    } catch (error) {
        // 失败时使用备用处理器
        return [execute(listeners[1][0], message, args)];
    }
};

const emitter = new FastEvent({
    executor: fallbackExecutor,
});

// 主要处理器
emitter.on('process', (data) => {
    return mainProcessor.process(data);
});

// 备用处理器
emitter.on('process', (data) => {
    return backupProcessor.process(data);
});
```
