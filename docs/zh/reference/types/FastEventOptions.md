# FastEventOptions 类型

事件发射器配置选项。

## 类型定义

```ts
export interface FastEventOptions<M = any, C = any> {
    debug?: boolean;
    id?: string;
    delimiter?: string;
    context?: C;
    ignoreErrors?: boolean;
    meta?: M;
    retain?: boolean;
    pipes?: FastListenerPipe[];
    executor?: FastListenerExecutor;
}
```

## 字段说明

| 字段         | 类型                 | 描述                 | 默认值    |
| ------------ | -------------------- | -------------------- | --------- |
| debug        | boolean              | 是否启用调试模式     | false     |
| id           | string               | 实例唯一标识符       | 自动生成  |
| delimiter    | string               | 事件名称分隔符       | '/'       |
| context      | C                    | 监听器执行上下文     | null      |
| ignoreErrors | boolean              | 是否忽略监听器错误   | true      |
| meta         | M                    | 实例级别元数据       | undefined |
| retain       | boolean              | 是否启用消息保留功能 | false     |
| pipes        | FastListenerPipe[]   | 全局监听器管道       | []        |
| executor     | FastListenerExecutor | 监听器执行策略       | 'queue'   |

## 配置示例

### 基本配置

```ts
const emitter = new FastEvent({
    debug: true,
    delimiter: '.',
    context: this,
    meta: { app: 'MyApp' },
});
```

### 错误处理配置

```ts
const emitter = new FastEvent({
    ignoreErrors: false, // 不忽略监听器错误
    pipes: [errorLogger], // 添加错误处理管道
});
```

### 高级配置

```ts
const emitter = new FastEvent({
    retain: true, // 启用消息保留
    executor: 'parallel', // 并行执行监听器
    pipes: [logger, validator], // 添加全局管道
});
```

## 监听器执行策略

| 策略     | 描述           | 适用场景             |
| -------- | -------------- | -------------------- |
| queue    | 顺序执行(默认) | 需要保证执行顺序     |
| parallel | 并行执行       | 独立无依赖的监听器   |
| race     | 竞争执行       | 只需要第一个成功结果 |

## 与 FastEventScopeOptions 的区别

| 特性     | FastEventOptions | FastEventScopeOptions  |
| -------- | ---------------- | ---------------------- |
| 用途     | 事件发射器配置   | 作用域配置             |
| 扩展字段 | 无               | name, parent, isolated |
| 继承规则 | 不适用           | 子作用域继承父配置     |

## 最佳实践

1. **生产环境配置**:

    ```ts
    new FastEvent({
        ignoreErrors: false,
        pipes: [errorHandler],
    });
    ```

2. **开发环境配置**:

    ```ts
    new FastEvent({
        debug: true,
        pipes: [logger],
    });
    ```

3. **性能优化配置**:
    ```ts
    new FastEvent({
        executor: 'parallel',
        retain: false,
    });
    ```

## 注意事项

1. 配置在实例化后无法修改
2. 管道会影响所有监听器的执行
3. 并行执行策略不保证顺序
4. 保留功能会增加内存使用
