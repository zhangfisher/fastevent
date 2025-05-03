# FastEventListener 类型

事件监听器函数类型定义。

## 类型定义

```ts
export type FastEventListener<T extends string = string, P = any, M = any, C = any> = (
    this: C,
    message: FastEventMessage<{ [K in T]: P }, M>,
    args: FastEventListenerArgs<M>,
) => any | Promise<any>;
```

## 参数说明

| 参数    | 类型                                 | 描述             |
| ------- | ------------------------------------ | ---------------- |
| this    | C                                    | 监听器执行上下文 |
| message | FastEventMessage<{ [K in T]: P }, M> | 事件消息对象     |
| args    | FastEventListenerArgs<M>             | 监听器执行参数   |

### message 参数

```ts
{
    type: T,           // 事件类型
    payload: P,        // 事件数据
    meta: M,           // 元数据
    timestamp: number, // 时间戳
    emitter: FastEvent // 事件发射器实例
}
```

### args 参数

```ts
{
    retain?: boolean;            // 是否为保留消息
    meta?: Partial<M>;           // 附加元数据
    abortSignal?: AbortSignal;   // 取消信号
    executor?: FastListenerExecutorArgs // 执行策略
}
```

## 返回值

返回 `any | Promise<any>`，支持同步和异步监听器。

## 与 FastEventAnyListener 的区别

| 特性     | FastEventListener       | FastEventAnyListener |
| -------- | ----------------------- | -------------------- |
| 类型安全 | 严格匹配特定事件类型    | 接受任意事件类型     |
| 泛型参数 | 固定事件类型 T 和负载 P | 使用 Events 泛型     |
| 适用场景 | 特定事件处理            | 通用事件处理         |

## 示例

### 基本用法

```ts
// 严格类型监听器
const listener: FastEventListener<'user.login', { id: number }> = function (message) {
    console.log('用户登录:', message.payload.id);
};

emitter.on('user.login', listener);
```

### 使用 this 上下文

```ts
class UserService {
    constructor(private emitter: FastEvent) {
        emitter.on('user.login', this.handleLogin, { context: this });
    }

    handleLogin: FastEventListener<'user.login', { id: number }, any, UserService> = function (message) {
        // this指向UserService实例
        this.saveUser(message.payload.id);
    };
}
```

### 异步处理

```ts
const asyncListener: FastEventListener<'data.fetch', { url: string }> = async function (message) {
    const data = await fetch(message.payload.url);
    return data.json();
};

emitter.on('data.fetch', asyncListener);
```

### 带执行参数

```ts
emitter.on(
    'task.run',
    (message, args) => {
        if (args.abortSignal?.aborted) {
            return; // 任务已取消
        }
        // 执行任务...
    },
    { executor: 'race' },
);
```

## 类型安全特性

1. **事件类型匹配**:

    - 严格匹配类型 T 和负载 P
    - 编译时类型检查

2. **上下文绑定**:

    - 通过 this 参数指定执行上下文类型
    - 运行时实际绑定由 options.context 决定

3. **元数据扩展**:
    - 通过 M 泛型参数扩展元数据类型
    - 保持消息对象类型一致

## 注意事项

1. 避免在监听器中修改 message 对象
2. 异步监听器需要正确处理错误
3. 匿名函数难以单独取消
4. 合理使用泛型参数保证类型安全
