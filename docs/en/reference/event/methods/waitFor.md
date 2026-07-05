# waitFor

Asynchronously waits for the specified event to be triggered.

## Method Signature

```ts
waitFor<T extends Types>(type: T, timeout?: number): Promise<FastEventMessage>
waitFor(type: string, timeout?: number): Promise<FastEventMessage>
waitFor<P = any>(type: string, timeout?: number): Promise<FastEventMessage>
```

## Parameters

| Parameter | Type     | Description                 |
| --------- | -------- | --------------------------- |
| type      | `string` | The event type to wait for  |
| timeout   | `number` | Wait configuration options  |


## Return Value

Returns a `Promise<FastEventMessage>` that resolves to the triggered event message object.
