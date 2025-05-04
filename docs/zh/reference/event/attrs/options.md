# Options

配置参数。

```ts
type FastEventOptions<Meta = Record<string, any>, Context = any> = {
    id?: string;
    debug?: boolean;
    // 事件分隔符
    delimiter?: string;
    // 侦听器函数执行上下文
    context?: Context;
    // 当执行侦听器函数出错时是否忽略,默认true
    ignoreErrors?: boolean;
    // 额外的全局元数据，当触发事件时传递给侦听器
    meta?: Meta;
    // 当创建新侦听器时回调
    onAddListener?: (type: string[], listener: FastEventListener) => void;
    // 当移除侦听器时回调
    onRemoveListener?: (type: string[], listener: FastEventListener) => void;
    // 当清空侦听器时回调
    onClearListeners?: () => void;
    // 当侦听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: (type: string, error: Error) => void;
    // 当执行侦听器前时回调,返回false代表取消执行
    onBeforeExecuteListener?: (message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void;
    // 当执行侦听器后时回调
    onAfterExecuteListener?: (message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void;
    //全局执行器
    executor?: FastListenerExecutorArgs;
};
```
