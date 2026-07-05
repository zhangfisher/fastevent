# clear

Unsubscribes listeners from all events, similar to `offAll`, but also clears all retained event messages.

## Method Signature

```ts
 clear(entry?: string):void
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `entry` | `string` | Optional. Unsubscribes all listeners whose names start with `entry`. If not specified, all listeners are unsubscribed. |

## Return Value

None
