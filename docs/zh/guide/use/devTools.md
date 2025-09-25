# 调试与诊断


## 调试插件

`FastEvent` 提供了调试工具，可以在`Redux DevTools`中查看触发的事件、监听器数量等信息。

### 第 1 步：安装 Redux DevTools

1. 对于 `Chrome` 浏览器：

    - 访问 [Chrome Web Store](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)
    - 点击"添加至 Chrome"安装扩展

2. 对于 `Firefox` 浏览器：
    - 访问 [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
    - 点击"添加到 Firefox"安装扩展

### 第 2 步：在代码中使用

在你的应用入口文件中导入`fastevent/devtools`,并开启`debug=true`.

```javascript
import 'fastevent/devtools';
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    debug: true, // [!code ++]
});
```

### 第 3 步：查看调试信息

1. 打开你的应用页面
2. 按 `12` 打开浏览器开发者工具
3. 找到 `Redux` 标签页（如果看不到，点击 `>>` 展开更多标签）
4. 在 `Redux DevTools` 中你可以看到：
    - 事件的触发记录
    - 事件的 payload 和 meta 数据
    - 订阅与取消订阅
    - 保留消息数量
    - 监听器的返回值以及调用次数

每次事件触发时，你都可以在`Redux DevTools`中看到详细的状态变化信息，这对于调试和理解应用的事件流非常有帮助。

![](./devtools.png)


## 监听信息

`FastEvent`还提供了一些辅助机制来帮助调试。

- **获取事件监听器元数据**

```ts
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();

const listener1 = () => {}
const listener2 = () => {}
const listener3 = () => {}

emitter.on('test', listener1)
emitter.on('test', listener2,{count: 10})
emitter.once('test', listener3)

const metas = emitter.getListeners('test');  // [!code ++]
console.log(metas);
// [[listener1,0,0],[listener2,10,0],[listener3,0,1]]


```

- `getListeners`方法用于获取事件监听器元数据，返回监听器注册信息`FastListenerMeta`。

```ts
type FastListenerMeta = [TypedFastEventListener<any, any>, number, number, string，number]
```

`FastListenerMeta`是一个数组，包含以下信息：
| 位置 | 类型 | 说明 |
| --- | --- | --- |
| `0` | `TypedFastEventListener` | 监听器函数 |
| `1` | `number` | 监听器调用限制次数，`0`表示无限制，`1`代表只调用一次 |
| `2` | `number` | 监听器实际执行的次数，当达到限制次数后，监听器将被移除 |
| `3` | `string` | 额外的标签，用于标识监听器，供调试使用 |
| `4` | `number` | 标识，用于额外标识监听器，高级选项 |


- **事件监听器标签**

使用`getListeners`方法获取监听器元数据时，有时无法获取监听函数的更详细信息。
此时，你可以为监听器添加额外的标签，用于标识监听器。


```ts
import { FastEvent } from 'fastevent';
const emitter = new FastEvent();

const listener = () => {} 

emitter.on('test', listener, {
    tag: 'modulex'  //[!code ++]
}) 

const metas = emitter.getListeners('test');  // [!code ++]
console.log(metas);
// [[listener,0,0,modulex]] // [!code ++]

```

:::warning 提示
通过`FastEvent.listeners`可以查看所有的监听器注册信息。
:::