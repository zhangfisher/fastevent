# clear

Like `offAll`, unsubscribes listeners for all events, but also clears all retained event messages.

## Method Signature

```ts
 clear(entry?: string):void
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `entry` | `string` | Optional parameter; specifies that all listeners whose names start with `entry` should be unsubscribed. If not specified, all listener subscriptions are removed. |

## Return Value

None
