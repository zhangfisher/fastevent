# 广播事件

## 特性概述

默认情况下，`emit("a")` 只会触发**精确订阅了 `a`** 的监听器。即便存在 `on("a/b")`、`on("a/*")` 这类后代订阅，它们也不会被唤醒——因为事件匹配在到达路径终点 `a` 后就停止，不再下探子树。

**广播（broadcast）** 是一种**发布端**的前缀广播能力：在一次 `emit` 中，除命中自身路径外，同时唤醒终点节点子树内**所有已订阅的后代监听器**（含通配符订阅与具体后代路径），并允许为每个后代改写其收到的事件消息。方向**仅向下**。

### 与通配符订阅的区别

- **通配符订阅**（`on("a/**")`）是**订阅端**声明：订阅者主动声明"我要收 `a` 的后代事件"，但只有一份监听器，且收到的事件 `type` 仍是触发时的原始类型，不区分具体命中的是哪个后代。
- **广播**（`emit("a", 1, { broadcast: true })`）是**发布端**行为：发布者一次把事件广播到 `a` 子树所有**已存在的后代订阅**，每个后代监听器收到的事件 `type` 会被改写为它自身订阅的路径。

两者并不冲突，可以并存。

:::tip 适用场景

- 状态变更需要通知整棵子树的所有订阅者（如组件树、配置树、命名空间）
- 一次发布需要让不同后代监听器收到与其订阅路径相匹配的消息
  :::

## 快速入门

最简单的用法——给 `emit` 传入 `broadcast: true`：

```ts
import { FastEvent } from "fastevent";

const emitter = new FastEvent();

emitter.on("a", (message) => {
    console.log(message.type); // 'a'
});
emitter.on("a/b", (message) => {
    console.log(message.type); // 'a/b'（被广播唤醒，type 改写为自身路径）
});
emitter.on("a/c", (message) => {
    console.log(message.type); // 'a/c'
});

// 一次 emit 同时触发 a、a/b、a/c
emitter.emit("a", 1, { broadcast: true });
```

也可以使用 `broadcast()` 快捷方法（等价于 `emit + { broadcast: true }`）：

```ts
emitter.broadcast("a", 1);
```

## 指南

### 默认改写

当 `broadcast: true` 时，后代监听器收到的事件消息会被**默认改写**：`type` 自动替换为该后代的完整订阅路径，其余字段（`payload`、`meta`）原样透传。

```ts
emitter.on("a/b", (message) => {
    console.log(message.type, message.payload); // 'a/b' 1
});

emitter.emit("a", 1, { broadcast: true });
```

正常匹配（emit 路径直接命中的监听器）**不经广播改写**，保持原始消息：

```ts
emitter.on("a", (message) => {
    console.log(message.type); // 'a'（原始 type，未改写）
});
```

### 自定义改写

传入函数作为 `broadcast`，可以逐个后代改写事件消息与参数。回调返回值支持三种形态：

| 返回值                    | 含义                     |
| ------------------------- | ------------------------ |
| `[message, args]` 元组    | 同时覆盖消息与参数       |
| 仅 `message` 对象         | 只覆盖消息，参数沿用原值 |
| `null` / `false` 等 falsy | **跳过该后代**（不触发） |

```ts
emitter.emit("a", 1, {
    broadcast: (type, message, args) => {
        // 为每个后代生成不同的 payload
        return [{ ...message, type, payload: `来自 ${type}` }, args];
    },
});

emitter.on("a/b", (message) => {
    console.log(message.payload); // '来自 a/b'
});
```

回调签名如下：

```ts
(
    type: string, // 该后代的完整订阅路径，如 'a/b/b1'
    message: FastEventMessage, // 原始事件消息
    args: FastEventListenerArgs, // 原始监听器参数
    // this 绑定到 emitter 实例
) => [FastEventMessage, FastEventListenerArgs] | FastEventMessage | null;
```

### 跳过后代

返回 `null` 可以选择性跳过某些后代，实现"只广播部分子树"：

```ts
emitter.emit("a", 1, {
    broadcast: (type, message) => {
        if (type.startsWith("a/private")) return null; // 跳过私有子树
        return { ...message, type };
    },
});
```

### broadcast() 快捷方法

`broadcast(type, payload, callback?, retain?)` 是 `emit` 的语法糖：

```ts
// 省略 callback —— 等价于 emit("a", 1, { broadcast: true })
emitter.broadcast("a", 1);

// 自定义改写
emitter.broadcast("a", 1, (type, message) => ({ ...message, type, payload: 999 }));

// 带保留
emitter.broadcast("a", 1, undefined, true);
```

### 通配符订阅与广播

广播会唤醒子树内**所有**已订阅的后代，包括通配符订阅节点。通配符节点收到的事件 `type` 是其**字面订阅路径**：

```ts
emitter.on("a/*", (message) => {
    console.log(message.type); // 'a/*'（字面路径）
});
emitter.on("a/**", (message) => {
    console.log(message.type); // 'a/**'
});

emitter.emit("a", 1, { broadcast: true });
// 触发 a/*（type='a/*'）、a/**（type='a/**'）
```

:::warning 注意
`emit("a")` 在**不开启广播**时不会触发 `a/*`、`a/**`——它们只在 `emit("a/具体")` 时被通配符匹配。广播补上的正是"一次 emit 唤醒整棵子树"的能力。
:::

### 执行顺序

广播时，监听器的执行顺序为：

1. **正常匹配**先触发（emit 路径直接命中的监听器）
2. **后代**按 **DFS 先序**触发（父先于子）

```ts
const order: string[] = [];
emitter.on("a", () => order.push("a"));
emitter.on("a/b", () => order.push("a/b"));
emitter.on("a/b/c", () => order.push("a/b/c"));
emitter.on("a/d", () => order.push("a/d"));

emitter.emit("a", 1, { broadcast: true });
console.log(order); // ['a', 'a/b', 'a/b/c', 'a/d']
```

终点节点自身只由正常匹配触发一次，**不会被广播重复触发**。

### 与消息转换（transform）配合

`transform` 与广播配合时遵循"**先广播后转换**"：广播先为每个后代改写 `type`，`transform` 再基于改写后的消息转换 `payload`。也就是说，`transform` 能够感知到每个后代的最终 `type`。

```ts
const emitter = new FastEvent({
    transform: (message) => message.type, // 用 type 作为 payload
});

emitter.on("a", (payload) => {
    console.log(payload); // 'a'
});
emitter.on("a/b", (payload) => {
    console.log(payload); // 'a/b'（transform 看到了广播改写后的 type）
});

emitter.emit("a", 1, { broadcast: true });
```

`transform` 会对**每一个最终消息**（正常 + 每个后代）各执行一次。

### 与保留事件（retain）

广播触发的事件**不会**写入保留（retain）表。`retain: true` 时只保留原始 `type` 的消息，与不开启广播时行为一致：

```ts
emitter.emit("a", 1, { broadcast: true, retain: true });

emitter.retainedMessages.has("a"); // true
emitter.retainedMessages.has("a/b"); // false（广播副本不保留）
```

### 一次性监听器与执行次数

广播触发的后代监听器是一次**真实执行**，`once`、`count` 等执行次数限制照常生效：

```ts
let count = 0;
emitter.once("a/b", () => count++);

emitter.emit("a", 1, { broadcast: true }); // 触发一次，once 注销
emitter.emit("a", 1, { broadcast: true }); // 再次广播，a/b 不再触发
console.log(count); // 1
```

### 异步触发

`emitAsync` 自动支持广播，无需额外处理：

```ts
await emitter.emitAsync("a", 1, { broadcast: true });
```

### FastEvent 特有：执行器与钩子

在主类 `FastEvent` 中，广播与既有特性配合如下：

- **执行器（executor）**：广播触发的后代监听器会按配置的执行器（`parallel` / `race` / `series` / …）执行，与普通触发一致。详见 [执行器](./executors/index)。
- **事件钩子（hooks）**：`BeforeExecuteListener` / `AfterExecuteListener` 只对**原始 emit 触发一次**，不会因后代广播而重复触发。`BeforeExecuteListener` 返回 `false` 仍会中止整个 emit（含后代广播）。详见 [事件钩子](./hooks)。

### LiteEvent 支持

`FastLiteEvent` 同样支持广播，API 完全一致（`emit` 的 `broadcast` 选项与 `broadcast()` 快捷方法）。详见 [LiteEvent](./liteevent)。

:::warning 边界与注意

- 广播方向**仅向下**（后代子树），不会向上触发祖先路径的监听器。
- 广播面向**已按具体/通配符路径订阅的现存监听器**；若终点节点没有子树订阅，广播不会有任何效果（等价于普通 emit）。
- 广播深度取决于订阅树的深度，深层子树广播会为每个后代生成独立的消息对象，注意性能。
  :::
