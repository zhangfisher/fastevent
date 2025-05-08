# Typescript

`FastEvent`提供强大的类型支持，可以方便的进行类型推断。

## 事件类型

`FastEvent`可以以泛型的方式定义事件类型，例如：

```ts twoslash
import { FastEvent } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>();

emitter.emit('click', 1);
//            ^|
//
//
//
//
//
```

在订阅事件时，可以提示事件类型，例如：

```ts twoslash
import { FastEvent } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>();

emitter.on('click', (message) => {
    message.type; // 'click'
    message.payload; // { x: number; y: number }
});

// 需要注意的是，在指定事件类型后，`FastEvent`同样也可以支持任意字符串事件名
emitter.on('xxx', (message) => {
    message.type;
    message.payload;
});
```

**`FastEvent`还提供了一个供全局扩展的 interface 类型`FastEvents`，作用于所有`FastEvent`实例。**

```ts
declare module 'fastevent' {
    interface FastEvents {
        click: { x: number; y: number };
        mousemove: boolean;
        scroll: number;
        focus: string;
    }
}
```

## 元数据类型

**`FastEvent`可以能自动推断全局元数据类型。**

```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    meta: {
        x: 1,
        y: 2,
    },
});

emitter.on('click', (message) => {
    // FastEventMeta  & { x: number; y: number } & Record<string,any>
    message.meta;
    //       ^?
});
//
//
//
//
```

**`FastEvent`也可以通过泛型的方式定义元数据类型。**

```ts twoslash
import { FastEvent } from 'fastevent';

type CustomMeta = { x: number; y: number; z?: number };
const emitter = new FastEvent<Record<string, any>, CustomMeta>({
    meta: {
        x: 1,
        y: 2,
    },
});

emitter.on('click', (message) => {
    // FastEventMeta  & { x: number; y: number,z?: number  } & Record<string,any>
    message.meta;
    //       ^?
});
//
```

**`FastEvent`还提供了一个供全局扩展的 interface 类型`FastEventMeta`，作用于所有`FastEvent`实例。**

```ts
declare module 'fastevent' {
    interface FastEventMeta {
        x: number;
        y: number;
    }
}
```

## 上下文类型

`FastEvent`监听函数的`this`默认指向`FastEvent`实例。

```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent();

emitter.on('click', function (message) {
    type This = typeof this
    this===emitter; // true
})
```

也可以在提供自定义`context`时自动推断类型。

```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent({
    context:{
        x:1,
        y:"hello"

    }
});

emitter.on('click', function (message) {
    type This = typeof this 
    //   ^?
})
// 
// 
// 
// 
// 
// 
``` 

## 检索类型

`FastEvent`和`FastEventScope`都提供了`types`对象用于检索事件类型。

```ts twoslash
import { FastEvent } from 'fastevent';

type CustomMeta = { x: number; y: number; z?: number };
type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
type CustomContext = {
    name: string,
    age: number
    address: string
};
const emitter = new FastEvent<CustomEvents, CustomMeta, CustomContext>({
    context: {
        name: "hello",
        age: 18,
        address: "beijing"
    }
});

type EventType = typeof emitter.types.events;
type MetaType = typeof emitter.types.meta;
type ContextType = typeof emitter.types.context;

```



:::warning  提示
`FastEventScope`的类型推断和声明与`FastEvent`基本相同。
:::


