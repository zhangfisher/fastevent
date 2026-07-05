# Message Transformation


## Message Format

By default, the message format received by `FastEvent` listeners is uniformly `FastEventMessage`, which roughly looks like:

```ts
{
    type:string
    payload:any
    meta?:any
}
```

A `FastEventMessage` includes:

- `type`: The event type
- `payload`: The event payload
- `meta`: Extra metadata of the event


```ts twoslash
import { FastEvent } from 'fastevent';

const emitter = new FastEvent()

emitter.on('x',(message)=>{
type keys =  keyof typeof message
})
```


## Transforming Messages

`FastEvent` supports the `transform` parameter to transform the event messages received by listeners, so listeners receive a different format.

```ts twoslash {12-17}
import { FastEvent,FastEventOptions } from 'fastevent';

// {<event name>:<message payload type>}
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

    message.type // click
    message.payload //{ x: number; y: number 

})

``` 
 
In the above code, we directly return the `payload` for the `div/click` and `div/mousemove` events.

This way, when a listener subscribes, it receives the message transformed by `transform` instead of the default `FastEventMessage`.


## Type Inference

However, the above code still has an issue: the type inference for `message` in `emitter.on('click',(message)=>{....})` is incorrect.

To provide friendly type inference, when declaring events, use `NotPayload` to mark the payload, indicating that the value in the event type is not a payload.


```ts twoslash 
import { FastEvent,FastEventOptions,NotPayload } from 'fastevent';

// {<event name>:<message payload type>}
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

You can also use `TransformedEvents` to declare all events, as follows:

```ts twoslash  {3-8}
import { FastEvent,FastEventOptions,TransformedEvents } from 'fastevent';

// {<event name>:<message payload type>}
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

## Scopes

`FastEvent` supports specifying a `transform` individually for each `scope` method.



```ts twoslash {15-17,26}
import { FastEvent,FastEventScope,TransformedEvents } from 'fastevent';

type CustomEvents = TransformedEvents<{
    'client/connect': number;
    'client/disconnect': number;
}>;

const emitter = new FastEvent();

class MyScope extends FastEventScope<CustomEvents> {
    constructor() {
        super(
            Object.assign(
                {
                    transform: (message:any) => {
                        return message.payload;
                    },
                },
                arguments[0],
            ),
        );
    }
}

const scope = emitter.scope('div', new MyScope());
// Or scope.options.transform=(message)=>{}  

scope.on('client/connect', (message) => {
    
});
scope.emit('client/connect', 100);
```



## Wildcards

Type inference during message transformation also supports wildcards.

```ts twoslash 
import { FastEvent,FastEventOptions,TransformedEvents } from 'fastevent';

// {<event name>:<message payload type>}
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



:::warning Note
-   `transform` is used to convert the standard FastEventMessage into the format you need.
-   `NotPayload` and `TransformedEvents` are used to declare types, providing type inference support for listeners such as `on`/`once`.
:::
