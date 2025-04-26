# API 参考

本节提供 FastEvent API 的详细文档。

## FastEvent 类

提供事件管理功能的主类。

### 构造函数

```typescript
constructor(options?: FastEventOptions)
```

#### 选项

```typescript
interface FastEventOptions<Meta = Record<string, any>, Context = any> {
    /** 发射器实例的唯一标识符 */
    id?: string;

    /** 是否启用调试模式 */
    debug?: boolean;

    /** 事件路径段的分隔符 */
    delimiter?: string;

    /** 事件处理器的默认执行上下文 */
    context?: Context;

    /** 是否忽略监听器错误 */
    ignoreErrors?: boolean;

    /** 附加到所有事件的全局元数据 */
    meta?: Meta;

    /** 添加监听器时的回调 */
    onAddListener?: (path: string[], listener: Function) => void;

    /** 移除监听器时的回调 */
    onRemoveListener?: (path: string[], listener: Function) => void;

    /** 清除所有监听器时的回调 */
    onClearListeners?: () => void;

    /** 监听器抛出错误时的回调 */
    onListenerError?: (type: string, error: Error) => void;

    /** 监听器执行后的回调（仅在调试模式） */
    onExecuteListener?: (message: FastEventMessage, returns: any[], listeners: any[]) => void;
}
```

### 核心方法

#### 事件订阅

```typescript
// 添加事件监听器
on(type: string, listener: Function): this

// 添加一次性事件监听器
once(type: string, listener: Function): this

// 移除特定监听器
off(type: string, listener: Function): this

// 移除某事件类型的所有监听器
offAll(type?: string): this

// 清除所有监听器
clear(): this
```

#### 事件发布

```typescript
// 发布事件
emit(type: string, payload?: any, retain?: boolean, meta?: any): any[]
emit(message: FastEventMessage): any[]

// 异步发布事件
emitAsync(type: string, payload?: any, retain?: boolean, meta?: any): Promise<any[]>
emitAsync(message: FastEventMessage): Promise<any[]>
```

#### 作用域管理

```typescript
// 创建新作用域
scope<Name extends string, Events extends Record<string, any> = Record<string, any>>(
    name: Name,
    options?: ScopeOptions
): FastEventScope<Events>
```

#### 保留消息

```typescript
// 检查是否有保留消息
hasRetained(type: string): boolean

// 获取保留消息
getRetained(type: string): FastEventMessage | undefined

// 清除特定保留消息
clearRetained(type: string): void

// 清除所有保留消息
clearAllRetained(): void
```

### 属性

```typescript
// 已注册监听器的数量
readonly listenerCount: number

// 保留消息的映射
readonly retainedMessages: Map<string, FastEventMessage>
```

## FastEventScope 类

提供作用域事件管理的类。

### 方法

继承 FastEvent 类的所有方法，路径自动添加作用域名前缀。

```typescript
// 创建嵌套作用域
scope<Name extends string, Events extends Record<string, any> = Record<string, any>>(
    name: Name,
    options?: ScopeOptions
): FastEventScope<Events>

// 清除作用域中的所有监听器
clear(): void
```

## 类型

### FastEventMessage

```typescript
interface FastEventMessage<T = string, P = any, M = unknown> {
    /** 事件类型/路径 */
    type: T;

    /** 事件负载 */
    payload: P;

    /** 事件元数据 */
    meta: M;
}
```

### FastEventListener

```typescript
type FastEventListener<T = string, P = any, M = unknown> = (message: FastEventMessage<T, P, M>) => any;
```

### ScopeOptions

```typescript
interface ScopeOptions<Meta = Record<string, any>, Context = any> {
    /** 作用域特定的元数据 */
    meta?: Meta;

    /** 作用域特定的上下文 */
    context?: Context;
}
```

## 类型参数

### FastEvent

```typescript
class FastEvent<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```

### FastEventScope

```typescript
class FastEventScope<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>
>
```
