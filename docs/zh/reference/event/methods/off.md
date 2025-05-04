# off

取消指定事件的监听器订阅。

## 方法签名

```ts
// 取消特定监听器
off(listener: FastEventListener<any, any, any>): void
// 取消所有指定字符串开头且匹配的监听器
off(type: string, listener: FastEventListener<any, any, any>): void
// 取消所有类型匹配的监听器
off(type: Types, listener: FastEventListener<any, any, any>): void
// 取消所有指定字符串开头的监听器
off(type: string): void
off(type: Types): void
```
 

## 返回值

无