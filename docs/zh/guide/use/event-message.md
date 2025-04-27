# 事件消息格式

FastEvent 使用标准化的消息格式处理所有事件，确保一致性和可扩展性。

## 消息结构

所有事件监听器都会接收到一个标准格式的消息对象`FastEventMessage`：

```typescript
interface FastEventMessage<T = string, P = any, M = Record<string, unknown>> {
    type: T; // 事件类型标识符
    payload: P; // 事件携带的数据
    meta: M; // 事件元数据
}
```

## 字段详解

| 字段      | 类型                      | 描述           |
| --------- | ------------------------- | -------------- |
| `type`    | `string`                  | 事件类型标识符 |
| `payload` | `any`                     | 事件携带的数据 |
| `meta`    | `Record<string, unknown>` | 事件元数据     |
