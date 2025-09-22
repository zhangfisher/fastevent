# 消息转换


## 消息格式

默认情况下，`FastEvent`监听器接收到的消息格式统一为`FastEventMessage`，大体如下：

```ts
{
    type:string
    payload:any
    meta?:any
}
```

`FastEventMessage`消息包括：

- `type`： 事件类型
- `payload`: 事件有效负载
- `meta`: 事件额外的元数据


```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent()

emitter.on('x',(message)=>{
type keys =  keyof typeof message
})
```


## 转换消息

`FastEvent`支持通过`transform`参数可以对监听器接收到的事件消息进行转换，让监听器中接收到不一样的格式。

```ts twoslash {12-17}
import { FastEvent,FastEventOptions } from 'fastevent';

// {<事件名称>:<消息有效负载payload类型>}
type CustomEvents = {
    'click': { x: number; y: number }
    'div/mousemove': boolean;
    'div/scroll': number;
    'div/focus': string;
};

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        if (['div/click', 'div/mousemove'].includes(message.type)) {
            return message.payload;
        }
        return message as any
    },
});

emitter.on('click',(message)=>{
    //              ^?
    // typeof message !== { x: number; y: number }  ❌



})

``` 




以上代码中，我们针对`div/click`、`div/mousemove`两种事件直接返回`payload`。

如此，在监听器订阅时可以接收到经`transform`转换后的消息，而不是默认的`FastEventMessage`。


## 类型推断

但是以上代码还存在一个问题，在`emitter.on('click',(message)=>{....})`的`message`的类型推断是错误的。

为提供友好的类型推断，需要在声明事件时，使用`NotPayload`对负载进行标识，表示事件类型中的值不是负载。


```ts twoslash 
import { FastEvent,FastEventOptions,NotPayload } from 'fastevent';

// {<事件名称>:<消息有效负载payload类型>}
type CustomEvents = {
    'click': NotPayload<{ x: number; y: number }>  // [!code ++]
    'div/mousemove': boolean;
    'div/scroll': number;
    'div/focus': string;
};

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        if (['div/click', 'div/mousemove'].includes(message.type)) {
            return message.payload;
        }
        return message  
    },
});

emitter.on('div/focus',(message)=>{
    message.type
    message.payload
})
emitter.on('click',(message)=>{
    //              ^?
    // typeof message === { x: number; y: number }  ✅



})

``` 

也可以使用`TransformedEvents`来声明所有事件，如下：

```ts twoslash  {3-8}
import { FastEvent,FastEventOptions,TransformedEvents } from 'fastevent';

// {<事件名称>:<消息有效负载payload类型>}
type CustomEvents = TransformedEvents<{
    'click': { x: number; y: number }  
    'div/mousemove': boolean;
    'div/scroll': number;
    'div/focus': string;
}>

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        return message.payload;
    },
});

emitter.on('div/focus',(message)=>{  })
emitter.on('click',(message)=>{  })
emitter.on('div/scroll',(message)=>{  })
emitter.on('div/mousemove',(message)=>{  })
``` 


## 作用域

消息转换时的类型推断还支持通配符。

```ts twoslash 
import { FastEvent,FastEventOptions,TransformedEvents } from 'fastevent';

// {<事件名称>:<消息有效负载payload类型>}
type CustomEvents = TransformedEvents<{
    'div/*/click': { id:String }  
    'div/*/mousemove': { x: number; y: number } ;
}>

const emitter = new FastEvent<CustomEvents>({
    transform: (message) => {
        return message.payload;
    },
});

const scope = emitter.scope('div')

scope.on('x/click',(message)=>{
    // typeof message === { id:string }
})
scope.on('y/mousemove',(message)=>{  
    // typeof message === { x: number; y: number }
})
``` 



:::warning 提示
-   `transform`用于将标准的 FastEventMessage 转换为你需要的格式
-   `NotPayload`和`TransformedEvents`用于声明类型，以便在`on/once`时为监听器提供类型声明。
:::