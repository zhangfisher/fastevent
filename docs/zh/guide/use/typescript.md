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


## 消息类型

`FastEvent`提供三种类型用于处理类型化的消息：

- `TypedFastEventMessage`类型
- `FastEventMessage`类型
- `typeof FastEvent.types.message`类型

`FastEvent`监听器接收到的是`TypedFastEventMessage`类型，该类型具有类型推断能力。

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
    type MessageType = typeof message;
    message.type; // 'click'
    message.payload; // { x: number; y: number }
});

```


如果需要构建一个受约束的消息，可以使用`typeof FastEvent.types.message`。

```ts twoslash
import { FastEvent,FastEventMessage } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};

const emitter = new FastEvent<CustomEvents>(); 

// 构建类型推断和约束的消息
type MessageType = typeof emitter.types.message // [!code ++]
const typedMessage:MessageType = {
    type:"click",
    payload: {
        x:100,
        y:100
    }
} 

```
`FastEvent`还额外提供了一个`FastEventMessage`类型用于不需要类型约束的场景。

```ts twoslash
import { FastEvent,FastEventMessage } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>(); 
 
// 构建通用的消息，没有类型推断和约束
const message:FastEventMessage = {
    type:"click",
    payload: 100
}
emitter.emit(message)

emitter.on('click', (message) => {
    message.type; // 'click'
    message.payload; // 100
})

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


## 监听器类型

`FastEvent`提供以下监听器函数类型。

- `TypedFastEventListener`

根据`FastEvent`泛型参数自动推导出来的监听器类型。

```ts twoslash
import { FastEvent,FastEventMessage } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>(); 
  
type ClickListener = typeof emitter.types.listeners['click']
const listener:ClickListener = (message) => {
    message.type
    message.payload
}

```

- `TypedFastEventAnyListener`

根据`FastEvent`泛型参数自动推导出来的监听器类型。

```ts twoslash
import { FastEvent,FastEventMessage } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>(); 
  
type anyListener = typeof emitter.types.anyListener

const listener:anyListener = (message) => {
    if(message.type=='click'){
        message.payload
    }else if(message.type=='mousemove'){
        message.payload
    }else if(message.type=='scroll'){
        message.payload
    }
}


```


- `FastEventListener`

通用的监听器类型。

```ts twoslash
import { FastEvent,FastEventMessage,FastEventListener } from 'fastevent';

type CustomEvents = {
    click: { x: number; y: number };
    mousemove: boolean;
    scroll: number;
    focus: string;
};
const emitter = new FastEvent<CustomEvents>(); 
  
type anyListener = typeof emitter.types.anyListener

const listener:FastEventListener<number> = (message) => {
    message.type
    message.payload    
}


```


## 检索类型

`FastEvent`和`FastEventScope`支持泛型参数推导，为提供了`types`对象用于检索以下类型。
 
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
type MessageType = typeof emitter.types.message;
type ListenersType = typeof emitter.types.listeners;
type anylistenerType = typeof emitter.types.anyListener;


```



:::warning  提示
`FastEventScope`的类型推断和声明与`FastEvent`基本相同。
:::


## 全局扩展

`FastEvent`和`FastEventScope`支持全局扩展，用于扩展`FastEvent`和`FastEventScope`的类型。

### FastEvents

扩展全局事件类型。

```ts twoslash
import { FastEvent } from 'fastevent';

declare module "fastevent" {
    interface FastEvents {
        click: { x: number; y: number };
        mousemove: boolean;
        scroll: number;
        focus: string;
    }
} 
const emitter = new FastEvent();

type EventTypes = typeof emitter.types.events

```


### FastEventMeta

扩展全局元数据类型。

```ts twoslash
import { FastEvent } from 'fastevent';

declare module "fastevent" {
    interface FastEventMeta {
        x: number;
        y: number;
        z?: number;
    }
} 

const emitter = new FastEvent();

type MetaType = typeof emitter.types.meta

emitter.onAny((message) => {
    message.meta.x  // number
    message.meta.y  // boolean
    message.meta.z  // string 
})
```


###  FastEventScopeMeta

扩展全局事件作用域元数据类型。

```ts  twoslash
import { FastEvent } from 'fastevent';

declare module "fastevent" {
    interface FastEventMeta {
        root: number;
    }
    interface FastEventScopeMeta {
        x: number;
        y: boolean;
        z?: string;
    }
} 

const emitter = new FastEvent();

const scope = emitter.scope("a/b/c");

type MetaType = typeof scope.types.meta

scope.onAny((message) => {
    message.meta.x  // number
    message.meta.y  // boolean
    message.meta.z  // string
    message.meta.scope // string
    message.meta.root // number
})

```

### FastEventMessageExtends

扩展全局消息类型。

```ts  twoslash
import { FastEvent,FastEventMessage } from 'fastevent';

declare module "fastevent" {
    interface FastEventMessageExtends {
        timestamp: number;
    }
} 

const message:FastEventMessage = {
    type: "click",
    payload: {
        x: 1,
        y: 2
    },
    timestamp: 1629999999999
}

```