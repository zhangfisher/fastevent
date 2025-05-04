# waitFor

异步等待指定事件触发。

## 方法签名

```ts
waitFor<T extends Types>(type: T, timeout?: number): Promise<FastEventMessage>
waitFor(type: string, timeout?: number): Promise<FastEventMessage>
waitFor<P = any>(type: string, timeout?: number): Promise<FastEventMessage>
```

## 参数

| 参数    | 类型                               | 描述             |
| ------- | ---------------------------------- | ---------------- |
| type    | `string` | 要等待的事件类型 |
| timeout | `number` | 等待配置选项     |


## 返回值

返回 `Promise<FastEventMessage>`，解析为触发的事件消息对象。