# LiteEvent

`FastLiteEvent` 是 `FastEvent` 的**轻量版本**：在保持相同核心 API 与类型体验的前提下，移除了作用域、执行器、管道、钩子、元数据、上下文等高级特性，体积约为 `FastEvent` 的 **1/3**（gzip 后约 2.3 KB）。

它适合对 bundle size 敏感的场景：浏览器端轻量集成、嵌入式运行时、微前端通信，以及任何"只需要可靠的事件收发"的项目。

## 导入

`FastLiteEvent` 通过独立子路径 `fastevent/lite` 导入，不会污染主入口：

```ts
import { FastLiteEvent } from 'fastevent/lite';
```

:::tip 主包零影响
`fastevent/lite` 是独立的构建产物，引入它不会把 `FastEvent` 的执行器、管道等代码打进你的 bundle。
:::

## 快速开始

`FastLiteEvent` 的核心 API 与 `FastEvent` 完全一致——监听、触发、通配符、保留事件都开箱即用：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

// 订阅
emitter.on('user/login', (message) => {
    console.log(message.type); // 'user/login'
    console.log(message.payload); // { id: 1 }
});

// 触发
emitter.emit('user/login', { id: 1 });
```

通配符同样支持 `*`（单层）与 `**`（多层）：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('user/*', (message) => {
    // 匹配 user/login、user/logout，但不匹配 user/profile/update
});

emitter.on('user/**', (message) => {
    // 匹配 user 下的任意层级
});
```

`retain` 保留事件也保留了下来——新订阅者会立即收到最后一条保留消息：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.emit('status', 'online', true); // retain=true

emitter.on('status', (message) => {
    console.log(message.payload); // 立即输出 'online'
});
```

## 与 FastEvent 的不同

`FastLiteEvent` 刻意去掉了下面这些高级特性，以换取更小的体积与更简单的执行路径：

| 分类 | `FastEvent` | `FastLiteEvent` |
| --- | --- | --- |
| **作用域**（`scope` / `FastEventScope`） | ✅ | ❌ |
| **执行器**（parallel / race / series / waterfall …） | ✅ | ❌（仅同步顺序执行） |
| **监听管道**（queue / throttle / debounce / retry …） | ✅ | ❌ |
| **事件钩子**（`onAddBeforeListener` 等） | ✅ | ❌ |
| **元数据**（`meta`） | ✅ | ❌ |
| **上下文**（`context` / 监听器 `this`） | ✅ 可配置 | ❌（`this` 恒为实例本身） |
| **异步迭代**（`for await` / `Iterator`） | ✅ | ❌ |
| **`waitFor`** 等待事件 | ✅ | ❌ |
| **`abortSignal`** 中止执行 | ✅ | ❌ |
| **调试**（`debug`） | ✅ | ❌ |
| **订阅时 `filter` / `off`** | ✅ | ❌ |
| **监听优先级 `prepend`** | ✅ | ❌ |
| 基础收发（`on` / `once` / `onAny` / `emit` / `emitAsync`） | ✅ | ✅ |
| 通配符 `*` / `**` | ✅ | ✅ |
| `retain` 保留事件 | ✅ | ✅ |
| `count` / `tag` / `flags` | ✅ | ✅ |
| `ignoreErrors` 错误吞咽 | ✅ | ✅ |
| `transform` 消息转换 | ✅ | ✅ |
| `off` / `offAll` / `clear` / `getListeners` / `clearRetainMessages` | ✅ | ✅ |

### 消息没有 `meta`

`FastLiteEvent` 的消息类型 `FastLiteMessage` 在 `FastEventMessage` 基础上移除了 `meta` 字段，只保留 `type` 与 `payload`：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('x', (message) => {
    type Keys = keyof typeof message;
    //   ^? 'type' | 'payload'
});
```

### 监听器的 `this`

`FastEvent` 支持通过 `context` 选项定制监听器内的 `this`；`FastLiteEvent` 移除了该能力，监听器内的 `this` 恒指向 emitter 实例本身：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();

emitter.on('x', function (message) {
    console.log(this === emitter); // true
});

emitter.emit('x');
```

### 类型标识

类型判断字段为 `__FastLiteEvent__`（对应 `FastEvent` 的 `__FastEvent__`）：

```ts twoslash
import { FastLiteEvent } from 'fastevent/lite';

const emitter = new FastLiteEvent();
console.log(emitter.__FastLiteEvent__); // true
```

## 何时选择 FastLiteEvent

:::tip 推荐以下场景使用 FastLiteEvent
- 浏览器端项目，对打包体积严格敏感
- 只需要基础的事件订阅 / 触发，不需要作用域、执行器、管道
- 嵌入式、IoT、小程序等资源受限运行时
- 作为微前端、SDK、组件库内部的事件总线
:::

:::warning 出现以下需求时，请直接使用 FastEvent
- 需要事件作用域（`scope`）做命名空间隔离
- 需要执行器（并行 / 串行 / 竞速 / 负载均衡）
- 需要监听管道（节流、防抖、重试、队列）
- 需要元数据（`meta`）、上下文（`context`）、事件钩子
- 需要 `waitFor`、异步迭代、`abortSignal` 等高级能力
:::

## 与 FastEvent 的互通

`FastLiteEvent` 的类型与 `FastEvent` 同源派生，监听器函数签名双向兼容——同一个监听器函数可以同时挂到 `FastEvent` 与 `FastLiteEvent` 上：

```ts twoslash
import { FastEvent } from 'fastevent';
import { FastLiteEvent } from 'fastevent/lite';

// 同一个监听器，签名兼容两者
const shared = (message: { type: string; payload: any }) => {
    console.log(message.type, message.payload);
};

const evt = new FastEvent();
const lite = new FastLiteEvent();

evt.on('x', shared);
lite.on('x', shared);
```

这使得在"核心用 `FastEvent`、边缘模块用 `FastLiteEvent`"的混合架构中，监听器逻辑可以自由复用。
