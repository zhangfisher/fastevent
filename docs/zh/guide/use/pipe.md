# 监听管道

## 概念

监听管道(`Pipe`)是 `FastEvent` 提供的一种强大机制，用于控制和修改事件监听器函数的执行行为。通过`pipe`，你可以为监听器添加超时控制、节流、防抖、重试等功能，使事件处理更加灵活和可控。

`pipe`的主要作用包括：

-   控制监听器的执行时机和频率
-   处理执行异常和重试
-   优化性能和资源使用
-   实现更复杂的事件处理逻辑

## 基本使用

在注册事件监听器时，可以通过`options.pipes`参数来使用一个或多个`pipe`：

```typescript
emitter.on('eventName', listener, {
  pipes: [pipe1(), pipe2(), ...]
})
```

多个`pipe`会按照数组顺序依次处理，形成处理链。等效于``pip23(pipe2(pipe1(listener)))....`

**示例 1**：基本 pipe 使用示例，展示如何为 API 请求添加超时和重试功能

```typescript
// 添加超时和重试功能
emitter.on(
    'api/request',
    async (msg) => {
        // 处理API请求
    },
    {
        pipes: [
            timeout(5000), // 5秒超时
            retry(3), // 失败时最多重试3次
        ],
    },
);
```

## 指南

### timeout (超时控制)

`timeout pipe`用于为监听器函数设置执行时间限制，如果超过指定时间未完成则会中断执行。

#### 功能

-   设置监听器的最大执行时间
-   超时后可以返回默认值或抛出错误
-   适用于需要时间限制的异步操作

#### 使用方法

```typescript
timeout(timeout: number, defaultValue?: any)
```

**参数：**

-   `timeout`: 超时时间(毫秒)
-   `defaultValue`: 可选的默认返回值，如果不提供则超时时抛出`imeoutError`

#### 示例

**示例 1**：基本超时控制，超时后抛出错误

```typescript
// 基本使用 - 超时抛出错误
emitter.on(
    'longTask',
    async () => {
        await someTimeConsumingTask();
    },
    {
        pipes: [timeout(100)], // 100ms超时
    },
);
```

**示例 2**：设置超时默认返回值，当超时时返回指定的默认值

```typescript
// 设置默认值
emitter.on(
    'apiRequest',
    async () => {
        const result = await fetchData();
        return result;
    },
    {
        pipes: [timeout(5000, 'default')], // 5秒超时返回'default'
    },
);
```

**示例 3**：多个事件同时触发时的超时处理，展示不同处理时间的任务如何响应超时

```typescript
// 多个事件触发时的超时处理
emitter.on(
    'task',
    async (msg) => {
        await delay(msg.payload); // 处理时间根据payload决定
        return msg.payload * 2;
    },
    {
        pipes: [timeout(150, 'timeout')], // 150ms超时
    },
);

// 触发事件
const results = await Promise.all([
    emitter.emit('task', 100), // 会在150ms内完成
    emitter.emit('task', 200), // 会超时
    emitter.emit('task', 50), // 会在150ms内完成
]);
// results: [200, 'timeout', 100]
```

**示例 4**：链式调用中的 timeout，展示如何在整个处理流程中设置超时

```typescript
// 链式调用中的timeout
emitter.on(
    'process',
    async (msg) => {
        const data = await transformData(msg.payload);
        return validate(data);
    },
    {
        pipes: [
            timeout(1000), // 整个处理流程1秒超时
            retry(2), // 失败时重试2次
        ],
    },
);
```

### throttle (节流)

`throttle pipe`用于限制监听器在一定时间内的执行频率，确保两次执行之间有足够的时间间隔。

#### 功能

-   控制监听器的执行频率
-   丢弃间隔时间内的额外调用
-   支持自定义处理被丢弃的事件

#### 使用方法

```typescript
throttle(interval: number, options?: {
  drop?: (message: FastEventMessage) => void
})
```

**参数：**

-   `interval`: 节流时间间隔(毫秒)
-   `options.drop`: 可选的回调函数，用于处理被丢弃的事件

#### 示例

**示例 1**：基本节流功能，限制 scroll 事件的触发频率

```typescript
// 基本节流
emitter.on(
    'scroll',
    () => {
        updatePosition();
    },
    {
        pipes: [throttle(100)], // 每100ms最多执行一次
    },
);
```

**示例 2**：处理被丢弃的事件，记录被节流机制跳过的输入

```typescript
// 处理被丢弃的事件
emitter.on(
    'input',
    (msg) => {
        processInput(msg.payload);
    },
    {
        pipes: [
            throttle(200, {
                drop: (msg) => console.log('丢弃的输入:', msg.payload),
            }),
        ],
    },
);
```

**示例 3**：连续触发场景演示，展示节流如何限制点击事件的触发次数

```typescript
// 连续触发场景
let count = 0;
emitter.on(
    'click',
    () => {
        count++;
    },
    {
        pipes: [throttle(500)], // 500ms内只执行一次
    },
);

// 快速连续触发5次
for (let i = 0; i < 5; i++) {
    emitter.emit('click');
    await delay(100);
}
// 最终count值为1
```

**示例 4**：带时间戳的节流，记录日志并处理被跳过的日志条目

```typescript
// 带时间戳的节流
emitter.on(
    'log',
    (msg) => {
        console.log(`[${new Date().toISOString()}]`, msg.payload);
    },
    {
        pipes: [
            throttle(1000, {
                drop: (msg) => {
                    console.log(`跳过日志: ${msg.payload}`);
                },
            }),
        ],
    },
);
```

**示例 5**：混合快速和慢速触发场景，展示节流在不同触发频率下的行为

```typescript
// 混合快速和慢速触发
emitter.emit('log', 'First message');
await delay(300);
emitter.emit('log', 'Second message'); // 会被跳过
await delay(800);
emitter.emit('log', 'Third message'); // 会执行
```

### memorize (缓存)

`memorize pipe` 用于缓存监听器的执行结果，对于相同的输入直接返回缓存的结果，避免重复计算。

#### 功能

-   缓存监听器的执行结果
-   支持自定义缓存判断逻辑
-   每个监听器的缓存相互独立

#### 使用方法

```typescript
memorize(predicate?: (message: FastEventMessage) => boolean)
```

**参数：**

-   `predicate`: 可选的判断函数，用于决定是否使用缓存

#### 示例

**示例 1**：基本缓存功能，避免重复执行计算密集型操作

```typescript
// 基本缓存
emitter.on(
    'calculate',
    (msg) => {
        return expensiveCalculation(msg.payload);
    },
    {
        pipes: [memorize()],
    },
);
```

**示例 2**：自定义缓存逻辑，根据特定条件决定是否使用缓存

```typescript
// 自定义缓存逻辑
emitter.on(
    'getData',
    (msg) => {
        return fetchData(msg.payload);
    },
    {
        pipes: [memorize((msg) => msg.payload === 'use-cache')],
    },
);
```

**示例 3**：缓存失效场景演示，展示不同参数如何影响缓存使用

```typescript
// 缓存失效场景
let callCount = 0;
emitter.on(
    'getUser',
    (msg) => {
        callCount++;
        return { id: msg.payload, name: `User ${msg.payload}` };
    },
    {
        pipes: [memorize()],
    },
);

// 相同参数多次调用
await emitter.emit('getUser', 1); // callCount = 1
await emitter.emit('getUser', 1); // callCount仍为1，使用缓存
await emitter.emit('getUser', 2); // callCount = 2，新参数
```

**示例 4**：复杂参数的缓存，使用 JSON 序列化比较参数是否相同

```typescript
// 复杂参数的缓存
emitter.on(
    'search',
    (msg) => {
        return db.query({
            keyword: msg.payload.keyword,
            filters: msg.payload.filters,
        });
    },
    {
        pipes: [
            memorize((msg) => {
                // 只有当keyword和filters完全相同时使用缓存
                return JSON.stringify(msg.payload) === JSON.stringify(lastQuery);
            }),
        ],
    },
);
```

**示例 5**：带过期时间的缓存，10 秒内使用缓存结果

```typescript
// 带过期时间的缓存
emitter.on(
    'getConfig',
    async (msg) => {
        return await fetchConfig(msg.payload);
    },
    {
        pipes: [
            memorize((msg, cached) => {
                // 10秒内使用缓存
                return cached && Date.now() - cached.timestamp < 10000;
            }),
        ],
    },
);
```

**示例 6**：组合使用缓存和超时，展示复杂场景下的缓存应用

```typescript
// 组合使用缓存和超时
emitter.on(
    'apiRequest',
    async (msg) => {
        const result = await fetchApi(msg.payload);
        return result;
    },
    {
        pipes: [
            memorize(),
            timeout(5000), // 5秒超时
        ],
    },
);
```

### retry (重试)

`retry pipe`用于在监听器执行失败时自动重试，支持设置重试次数和间隔。

#### 功能

-   失败时自动重试
-   可配置最大重试次数
-   支持自定义重试间隔
-   可以处理最终失败的情况

#### 使用方法

```typescript
retry(maxRetries: number, options?: {
  interval?: number,
  drop?: (message: FastEventMessage, error: Error) => void
})
```

**参数：**

-   `maxRetries`: 最大重试次数
-   `options.interval`: 重试间隔时间(毫秒)
-   `options.drop`: 达到最大重试次数后的回调函数

#### 示例

**示例 1**：基本重试功能，连接失败时自动重试 3 次

```typescript
// 基本重试
emitter.on(
    'connect',
    async () => {
        await connectToServer();
    },
    {
        pipes: [retry(3)], // 失败时最多重试3次
    },
);
```

**示例 2**：自定义重试配置，设置固定重试间隔和失败回调

```typescript
// 自定义重试配置
emitter.on(
    'sendRequest',
    async () => {
        await apiRequest();
    },
    {
        pipes: [
            retry(2, {
                interval: 1000, // 1秒后重试
                drop: (msg, error) => console.error('最终失败:', error),
            }),
        ],
    },
);
```

**示例 3**：带指数退避的重试策略，重试间隔随次数指数增长

```typescript
// 带指数退避的重试
emitter.on(
    'upload',
    async (msg) => {
        await uploadFile(msg.payload);
    },
    {
        pipes: [
            retry(4, {
                interval: (retryCount) => 1000 * Math.pow(2, retryCount), // 指数退避
                drop: (msg, error) => notifyAdmin(`上传失败: ${msg.payload.name}`),
            }),
        ],
    },
);
```

**示例 4**：条件性重试，仅对特定错误进行重试

```typescript
// 条件性重试
emitter.on(
    'processPayment',
    async (msg) => {
        const result = await paymentGateway(msg.payload);
        if (result.status === 'pending') {
            throw new Error('Payment pending');
        }
        return result;
    },
    {
        pipes: [
            retry(3, {
                shouldRetry: (error) => error.message.includes('pending'), // 仅重试特定错误
                interval: 2000,
            }),
        ],
    },
);
```

**示例 5**：重试成功场景演示，展示重试机制如何最终成功

```typescript
// 重试成功场景
let attempt = 0;
emitter.on(
    'unstableService',
    async () => {
        attempt++;
        if (attempt < 3) {
            throw new Error('Service unavailable');
        }
        return 'Success';
    },
    {
        pipes: [retry(3)],
    },
);

const result = await emitter.emit('unstableService');
// result: 'Success' (在第3次尝试时成功)
```

**示例 6**：组合使用重试和超时，展示复杂场景下的重试应用

```typescript
// 组合使用重试和超时
emitter.on(
    'apiCall',
    async () => {
        const result = await fetchApi();
        return result;
    },
    {
        pipes: [
            retry(2, { interval: 1000 }),
            timeout(3000), // 每次调用最多3秒
        ],
    },
);
```

### debounce (防抖)

`debounce pipe` 用于延迟监听器的执行，直到一定时间内没有新的调用发生。

#### 功能

-   延迟执行监听器
-   取消之前的待执行调用
-   支持处理被丢弃的事件
-   适用于频繁触发的事件处理

#### 使用方法

```typescript
debounce(wait: number, options?: {
  drop?: (message: FastEventMessage) => void
})
```

**参数：**

-   `wait`: 等待时间(毫秒)
-   `options.drop`: 可选的回调函数，用于处理被丢弃的事件

#### 示例

**示例 1**：基本防抖功能，窗口 resize 事件 200ms 无新触发才执行

```typescript
// 基本防抖
emitter.on(
    'resize',
    () => {
        updateLayout();
    },
    {
        pipes: [debounce(200)], // 200ms内没有新调用时才执行
    },
);
```

**示例 2**：处理被丢弃的事件，记录被防抖机制跳过的搜索请求

```typescript
// 处理被丢弃的事件
emitter.on(
    'search',
    (msg) => {
        performSearch(msg.payload);
    },
    {
        pipes: [
            debounce(300, {
                drop: (msg) => console.log('丢弃的搜索:', msg.payload),
            }),
        ],
    },
);
```

**示例 3**：立即执行模式，按钮点击立即响应但忽略后续快速点击

```typescript
// 立即执行模式
emitter.on(
    'click',
    () => {
        console.log('Button clicked!');
    },
    {
        pipes: [
            debounce(1000, {
                immediate: true, // 第一次触发立即执行
                drop: () => console.log('快速点击被忽略'),
            }),
        ],
    },
);
```

**示例 4**：最大等待时间，确保分析事件最多延迟 2 秒必须发送

```typescript
// 最大等待时间
let lastCall = 0;
emitter.on(
    'analytics',
    (msg) => {
        lastCall = Date.now();
        sendAnalytics(msg.payload);
    },
    {
        pipes: [
            debounce(500, {
                maxWait: 2000, // 最多等待2秒必须执行
                drop: (msg) => trackDroppedEvent(msg),
            }),
        ],
    },
);
```

**示例 5**：连续触发场景，展示防抖如何限制频繁输入事件

```typescript
// 连续触发场景
let executionCount = 0;
emitter.on(
    'typing',
    () => {
        executionCount++;
    },
    {
        pipes: [debounce(100)],
    },
);

// 快速连续输入
for (let i = 0; i < 10; i++) {
    emitter.emit('typing');
    await delay(50);
}
await delay(150);
// executionCount最终为1
```

**示例 6**：带取消功能的防抖，防止过时的 fetch 请求

```typescript
// 带取消功能的防抖
const controller = new AbortController();
emitter.on(
    'fetch',
    async (msg) => {
        const data = await fetchWithSignal(msg.payload, controller.signal);
        return data;
    },
    {
        pipes: [
            debounce(300, {
                cancel: controller.abort.bind(controller),
            }),
        ],
    },
);
```

### queue (队列)

`queue pipe` 用于将监听器的执行放入队列中，控制并发执行和处理顺序。

#### 功能

-   控制监听器的并发执行
-   管理事件处理队列
-   支持多种溢出处理策略
-   可以自定义队列排序逻辑

#### 使用方法

```typescript
queue(options: {
  size?: number,
  overflow?: 'slide' | 'drop' | 'throw' | 'expand',
  expandOverflow?: 'slide' | 'drop' | 'throw',
  maxExpandSize?: number,
  onNew?: (newMsg: FastEventMessage, queuedMsgs: FastEventMessage[]) => void
})
```

**参数：**

-   `size`: 队列大小
-   `overflow`: 队列满时的处理策略
-   `expandOverflow`: 扩展策略(当 overflow 为`expand`时使用)
-   `maxExpandSize`: 最大扩展大小
-   `onNew`: 新消息入队时的处理函数

#### 示例

**示例 1**：基本队列功能，限制任务队列大小

```typescript
// 基本队列
emitter.on(
    'task',
    async (msg) => {
        await processTask(msg.payload);
    },
    {
        pipes: [queue({ size: 5 })], // 最多同时放置5个任务
    },
);
```

**示例 2**：队列溢出处理，当队列满时移除最旧的任务

```typescript
// 队列溢出处理
emitter.on(
    'log',
    (msg) => {
        writeToDisk(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 10,
                overflow: 'slide', // 移除最旧的任务
            }),
        ],
    },
);
```

**示例 3**：优先级队列，根据任务优先级调整处理顺序

```typescript
// 优先级队列
emitter.on(
    'job',
    async (msg) => {
        await runJob(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 3,
                onNew: (newMsg, queuedMsgs) => {
                    // 根据优先级排序
                    const insertIndex = queuedMsgs.findIndex((msg) => (msg.meta.priority ?? 0) < (newMsg.meta.priority ?? 0));
                    queuedMsgs.splice(insertIndex, 0, newMsg);
                },
            }),
        ],
    },
);
```

**示例 4**：可扩展队列，动态调整队列大小

```typescript
// 可扩展队列
emitter.on(
    'request',
    async (msg) => {
        await handleRequest(msg.payload);
    },
    {
        pipes: [
            queue({
                size: 2,
                overflow: 'expand',
                maxExpandSize: 4,
                expandOverflow: 'drop',
            }),
        ],
    },
);
```
