# 类型定义

FastEvent 使用的主要类型定义。

## FastEventMessage

表示事件消息的接口：

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

### 泛型参数

-   `T`: 事件类型（通常是字符串）
-   `P`: 负载类型
-   `M`: 元数据类型

## FastEventListener

事件监听器函数类型：

```typescript
type FastEventListener<T = string, P = any, M = unknown> = (message: FastEventMessage<T, P, M>) => any;
```

## FastEventOptions

FastEvent 构造函数的选项：

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

## ScopeOptions

作用域配置选项：

```typescript
interface ScopeOptions<Meta = Record<string, any>, Context = any> {
    /** 作用域特定的元数据 */
    meta?: Meta;

    /** 作用域特定的上下文 */
    context?: Context;
}
```

## 实用类型

### EventMap

表示事件类型映射的通用类型：

```typescript
type EventMap = Record<string, any>;
```

### MetaMap

表示元数据类型的通用类型：

```typescript
type MetaMap = Record<string, any>;
```

## 类型使用示例

### 定义事件类型

```typescript
interface UserEvents {
    login: { id: number; name: string };
    logout: { id: number };
}

interface AppMeta {
    version: string;
    timestamp: number;
}

const events = new FastEvent<UserEvents, AppMeta>();
```

### 定义作用域类型

```typescript
interface ApiEvents {
    request: { url: string; method: string };
    response: { status: number; data: any };
}

const apiScope = events.scope<'api', ApiEvents>('api', {
    meta: { service: 'api-gateway' },
});
```

### 自定义监听器

```typescript
const userLoginHandler: FastEventListener<'user/login', { id: number }, { ip: string }> = (message) => {
    console.log(`用户 ${message.payload.id} 从 ${message.meta.ip} 登录`);
};

events.on('user/login', userLoginHandler);
```

## 类型最佳实践

1. **保持类型专注**：

    - 为不同模块定义独立的事件类型
    - 避免使用过于宽泛的类型

2. **文档化类型**：

    - 使用 TSDoc 注释
    - 说明每个字段的用途
    - 提供示例

3. **类型复用**：

    - 使用公共基础类型
    - 通过继承扩展类型
    - 使用实用类型

4. **类型安全**：

    - 避免使用 any
    - 使用类型守卫
    - 验证运行时类型

5. **版本控制**：
    - 类型随 API 版本更新
    - 考虑向后兼容
    - 废弃类型要标记
