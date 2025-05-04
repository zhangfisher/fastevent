# 构造函数

核心事件发射器类`FastEvent`，提供事件发布/订阅功能，支持：

-   事件订阅(on/once)
-   事件发布(emit/emitAsync)
-   通配符匹配
-   事件作用域(scope)
-   保留事件(retain)
-   异步事件处理

## 构造函数

```ts
constructor(options?: FastEventOptions<Meta, Context>)


 type FastEventOptions<Meta = Record<string, any>, Context = any> = {
    id?: string
    debug?: boolean
    // 事件分隔符
    delimiter?: string
    // 侦听器函数执行上下文
    context?: Context
    // 当执行侦听器函数出错时是否忽略,默认true
    ignoreErrors?: boolean
    // 额外的全局元数据，当触发事件时传递给侦听器
    meta?: Meta
    // 当创建新侦听器时回调
    onAddListener?: (type: string[], listener: FastEventListener) => void
    // 当移除侦听器时回调
    onRemoveListener?: (type: string[], listener: FastEventListener) => void
    // 当清空侦听器时回调
    onClearListeners?: () => void
    // 当侦听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: ((type: string, error: Error) => void)
    // 当执行侦听器前时回调,返回false代表取消执行
    onBeforeExecuteListener?: (message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void
    // 当执行侦听器后时回调
    onAfterExecuteListener?: (message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void
    //全局执行器
    executor?: FastListenerExecutorArgs
}
```

### id

-   **类型：**`string`
-   **默认值：**`自动生成`

可选，唯一标识。

### debug

-   **类型：**`boolean`
-   **默认值：**`false`

可选，调试模式。开启后可以启用`Redux DevTools`调试事件，详见[调试工具](../../guide/use/devTools)

### delimiter

-   **类型：**`string`
-   **默认值：**`/`

可选，事件分隔符，用于分隔多层事件。

### context

-   **类型：**`any`
-   **默认值：**`this`

可选，侦听器函数执行上下文,默认是`FastEvent`实例。

### ignoreErrors

-   **类型：**`boolean`
-   **默认值：**`true`

可选，当执行侦听器函数出错时是否忽略错误，默认`true`。即捕获错误并返回错误对象，而不是触发错误。

### meta

-   **类型：**`Meta`
-   **默认值：**`undefined`

可选，全局元数据，当触发事件时传递给监听器函数。

### onAddListener

-   **类型：**`(type: string[], listener: FastEventListener) => void`
-   **默认值：**`undefined`

可选，当创建新侦听器时回调。

### onRemoveListener

-   **类型：**`(type: string[], listener: FastEventListener) => void`
-   **默认值：**`undefined`

可选，当移除侦听器时回调。

### onClearListeners

-   **类型：**`() => void`
-   **默认值：**`undefined`

可选，当清空侦听器时回调。

### onListenerError

-   **类型：**`(type: string, error: Error) => void`
-   **默认值：**`undefined`

可选，当执行侦听器函数出错时的回调，用于诊断时使用,可以打印错误信息。

### onBeforeExecuteListener

-   **类型：**`(message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void`
-   **默认值：**`undefined`

可选，当执行侦听器前时回调,返回 false 代表取消执行。

### onAfterExecuteListener

-   **类型：**`(message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void`
-   **默认值：**`undefined`

可选，当执行侦听器后时回调。

### executor

-   **类型：**`FastListenerExecutorArgs`
-   **默认值：**`undefined`

可选，全局执行器，用于自定义如何执行侦听器函数。

## 泛型参数

```ts
class FastEvent<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
>
```

### Events

事件类型定义，继承自`FastEvents`接口。

### Meta

全局事件元数据类型。

### Context

侦听器函数执行上下文类型。

### Types

事件类型的键名类型，默认为 Events 的键名类型
