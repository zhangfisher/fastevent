# FastEventMessage 类型

事件消息核心数据结构。

## 类型定义

```ts
export type FastEventMessage<Events extends Record<string, any> = Record<string, any>, M = any> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta: FastEventMeta & M & Record<string, any>;
    };
}[Exclude<keyof Events, number | symbol>] &
    FaseEventMessageExtends;
```

## 字段说明

| 字段      | 类型                                    | 描述                                                                                 |
| --------- | --------------------------------------- | ------------------------------------------------------------------------------------ |
| type      | string                                  | 事件类型名称                                                                         |
| payload   | Events[K]                               | 事件负载数据                                                                         |
| meta      | FastEventMeta & M & Record<string, any> | 元数据，包含：<br>- 基础元数据(FastEventMeta)<br>- 自定义元数据(M)<br>- 任意扩展字段 |
| timestamp | number                                  | 事件触发时间戳(自动添加)                                                             |
| emitter   | FastEvent                               | 事件发射器实例(自动添加)                                                             |

## 基础元数据(FastEventMeta)

```ts
export interface FastEventMeta {
    priority?: number; // 事件优先级
}
```

## 与 FastEventEmitMessage 的区别

| 特性     | FastEventMessage       | FastEventEmitMessage |
| -------- | ---------------------- | -------------------- |
| 用途     | 内部事件消息           | emit 方法参数类型    |
| payload  | 必填                   | 可选                 |
| meta     | 必填                   | 可选                 |
| 自动字段 | 包含 timestamp/emitter | 不包含               |

## 示例

### 类型定义示例

```ts
// 定义事件类型
interface AppEvents {
    'user.login': { userId: number; username: string };
    'user.logout': { userId: number };
}

// 消息类型推断
type AppMessage = FastEventMessage<AppEvents, { source: string }>;

// 实际消息示例
const message: AppMessage = {
    type: 'user.login',
    payload: { userId: 123, username: 'test' },
    meta: {
        priority: 1,
        source: 'mobile',
        timestamp: Date.now(),
    },
    emitter: eventInstance,
};
```

### 使用场景

```ts
// 监听器中使用
emitter.on('user.login', (message: FastEventMessage<AppEvents>) => {
    console.log(message.type); // 'user.login'
    console.log(message.payload.userId); // 123
    console.log(message.meta.priority); // 1
});

// 创建消息对象
const message: FastEventEmitMessage<AppEvents> = {
    type: 'user.login',
    payload: { userId: 123, username: 'test' },
};
```

## 扩展机制

1. **元数据扩展**:

    - 通过泛型参数 M 扩展元数据类型
    - 保留基础元数据字段

2. **全局扩展**:

    - 通过 FaseEventMessageExtends 接口扩展
    - 可添加公共字段

3. **事件类型安全**:
    - 严格匹配事件类型与 payload 类型
    - 编译时类型检查

## 注意事项

1. 实际使用时通常不需要手动创建此类型对象
2. meta 字段会被自动合并基础元数据和自定义元数据
3. 在监听器中可以安全地进行类型断言
4. 避免直接修改消息对象
