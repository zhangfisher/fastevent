# waitFor() 方法

异步等待指定事件触发。

## 方法签名

```ts
waitFor<T extends Types = Types>(
    type: T,
    options?: FastEventWaitOptions<Events, Meta>
): Promise<FastEventMessage<Events, Meta>>

waitFor<T extends string>(
    type: T,
    options?: FastEventWaitOptions<Events, Meta>
): Promise<FastEventMessage<Events, Meta>>

waitFor(
    type: '**',
    options?: FastEventWaitOptions<Events, Meta>
): Promise<FastEventMessage<Events, Meta>>
```

## 参数

| 参数    | 类型                               | 描述             |
| ------- | ---------------------------------- | ---------------- |
| type    | T \| string \| '\*\*'              | 要等待的事件类型 |
| options | FastEventWaitOptions<Events, Meta> | 等待配置选项     |

### options 配置

```ts
interface FastEventWaitOptions<Events, Meta> {
    timeout?: number; // 超时时间(毫秒)
    filter?: (message: FastEventMessage<Events, Meta>) => boolean; // 消息过滤器
    meta?: Meta; // 自定义元数据
    retain?: boolean; // 是否检查保留消息
}
```

## 返回值

返回 `Promise<FastEventMessage<Events, Meta>>`，解析为触发的事件消息对象。

## 示例

### 基本用法

```ts
// 等待用户登录事件
async function initApp() {
    const message = await emitter.waitFor('user.login');
    console.log('用户已登录:', message.payload);
    // 继续应用初始化...
}
```

### 带超时处理

```ts
try {
    // 等待最多5秒
    const message = await emitter.waitFor('db.ready', {
        timeout: 5000,
    });
    console.log('数据库已就绪');
} catch (error) {
    console.error('等待数据库超时', error);
}
```

### 使用过滤器

```ts
// 只等待特定用户登录
const message = await emitter.waitFor('user.login', {
    filter: (msg) => msg.payload.userId === 123,
});
```

### 检查保留消息

```ts
// 如果事件已经触发过且有保留消息，立即返回
const message = await emitter.waitFor('app.initialized', {
    retain: true,
});
```

### 异步流程控制

```ts
// 等待多个事件
async function startup() {
    const [dbReady, cacheReady] = await Promise.all([emitter.waitFor('db.ready'), emitter.waitFor('cache.ready')]);
    console.log('所有服务已就绪');
}
```

## 与 once()方法的区别

| 特性     | waitFor()       | once()         |
| -------- | --------------- | -------------- |
| 接口类型 | Promise         | 回调           |
| 超时处理 | 支持            | 不支持         |
| 错误处理 | 通过 catch 捕获 | 通过 try-catch |
| 返回值   | 返回消息对象    | 返回订阅对象   |
| 适用场景 | 异步等待        | 一次性监听     |

## 注意事项

1. **超时处理**:

    - 默认不设置超时(无限等待)
    - 超时会拒绝 Promise，抛出 TimeoutError
    - 建议为关键操作设置合理超时

2. **错误处理**:

    - 必须使用 try-catch 或 catch()处理错误
    - 错误类型包括 TimeoutError 和监听器抛出的错误

3. **保留消息**:

    - 设置 retain: true 会检查历史保留消息
    - 如果存在匹配的保留消息，立即解析 Promise

4. **性能考虑**:

    - 长时间等待会占用内存
    - 大量 waitFor()可能影响性能
    - 建议合理使用超时设置

5. **使用建议**:
    - 服务初始化等待
    - 异步操作完成通知
    - 测试中的事件断言
    - 状态转换等待

## 最佳实践

1. 为关键操作设置合理的超时时间
2. 使用明确的错误处理逻辑
3. 在 async 函数中使用 await 简化代码
4. 结合 Promise.all 等待多个事件
5. 在测试中使用 waitFor 断言事件触发
