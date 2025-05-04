# 构造函数

创建事件作用域。

## 构造函数

```ts
constructor(
    public emitter: FastEvent<Events>, 
    public prefix: string, 
    options?: FastEventScopeOptions<Meta, Context>
)

type FastEventScopeOptions<Meta, Context> = {
    meta?: FastEventMeta & Meta
    context?: Context
    executor?: FastListenerExecutorArgs
}
```

### meta

-   **类型：**`Record<string,any>`
-   **默认值：**`undefined`

可选，唯一标识。 
### context

-   **类型：**`any`
-   **默认值：**`this`

可选，侦听器函数执行上下文,默认是`FastEvent`实例。

### executor

-   **类型：**`FastListenerExecutorArgs`
-   **默认值：**`undefined`
 
指定监听器执行器。

### Types

用于获取事件作用域的事件类型定义.

```ts
interface 
const scope = emitter.scope<Events>("user")
typeof scope.types
```
