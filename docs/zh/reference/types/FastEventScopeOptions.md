# FastEventScopeOptions 类型

作用域配置选项类型。

## 类型定义

```ts
export interface FastEventScopeOptions<Meta, Context> {
    meta?: FastEventMeta & Meta;
    context?: Context;
    executor?: FastListenerExecutorArgs;
}
```

## 字段说明

| 字段     | 类型                     | 描述             | 默认值       |
| -------- | ------------------------ | ---------------- | ------------ |
| meta     | FastEventMeta & Meta     | 作用域元数据     | undefined    |
| context  | Context                  | 监听器执行上下文 | 继承父作用域 |
| executor | FastListenerExecutorArgs | 监听器执行策略   | 继承父作用域 |

## 元数据结构

```ts
export interface FastEventMeta {
    scope: string; // 作用域名称(自动添加)
    priority?: number; // 事件优先级
    [key: string]: any; // 自定义扩展字段
}
```

## 配置示例

### 基本配置

```ts
const scope = emitter.scope('user', {
    meta: {
        priority: 1,
        module: 'user',
    },
    context: this,
});
```

### 继承配置

```ts
const parentScope = emitter.scope('parent', {
    meta: { version: '1.0' },
    executor: 'parallel',
});

const childScope = parentScope.scope('child', {
    meta: { debug: true }, // 继承version和executor
});
```

### 上下文绑定

```ts
class UserService {
    constructor(emitter) {
        this.scope = emitter.scope('user', {
            context: this, // 绑定执行上下文
        });
    }
}
```

## 与 FastEventOptions 的区别

| 特性     | FastEventScopeOptions | FastEventOptions |
| -------- | --------------------- | ---------------- |
| 用途     | 作用域配置            | 事件发射器配置   |
| 必填字段 | 无                    | 无               |
| 继承机制 | 子作用域继承父配置    | 不适用           |
| 自动字段 | scope                 | 无               |

## 最佳实践

1. **模块化配置**:

    ```ts
    // 用户模块
    const userScope = emitter.scope('user', {
        meta: { module: 'user' },
        executor: 'queue',
    });
    ```

2. **调试配置**:

    ```ts
    const debugScope = emitter.scope('debug', {
        meta: { debug: true, trace: true },
    });
    ```

3. **性能优化**:
    ```ts
    const perfScope = emitter.scope('perf', {
        executor: 'parallel', // 并行处理
    });
    ```

## 注意事项

1. meta.scope 字段会被自动设置为作用域名称
2. 子作用域会深度合并父作用域的 meta
3. 上下文绑定后无法修改
4. 执行策略会影响所有子作用域
