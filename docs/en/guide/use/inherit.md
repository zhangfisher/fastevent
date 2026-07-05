# Class Inheritance

`FastEvent` provides two classes, `FastEvent` and `FastEventScope`. In addition to creating standalone instances, you can also create them via inheritance.


## Inheriting FastEvent

```ts  
import { FastEvent, FastEventOptions } from 'fastevent'
interface MyEventOptions extends FastEventOptions {
    count?: number
}
class MyEvent extends FastEvent {
    constructor(options?: Partial<MyEventOptions>) {
        super(Object.assign({}, options))
    }
    get options() {
        return super.options as MyEventOptions // [!code ++]
    }
}

const emitter = new MyEvent()
emitter.on('test', function (this, message) {
   type This = typeof this   // [!code ++]
})  
type OptionsType = typeof emitter.options
emitter.options.count = 100
```

- The `MyEvent` above inherits from `FastEvent` and overrides the `Options`.

**When creating a `FastEvent` instance, if you pass in a `context` parameter, things are a bit different.**

```ts  
import { FastEvent, FastEventOptions } from 'fastevent'
interface MyEventOptions extends FastEventOptions {
    count?: number
}
class MyEvent extends FastEvent {
    constructor(options?: Partial<MyEventOptions>) {
        super(Object.assign({}, options))
    }
}
const emitter = new MyEvent({
    context: { a: 1 } as never
})
emitter.on('test', function (this, message) {
   type This = typeof this   // [!code error]
   // This !== {a:1}
   // This == MyEvent
})  
type OptionsType = typeof emitter.options 
```

**In the example above, why is the listener function's `this` actually `{a:1}` at runtime, yet its type is not `{a:1}`?**

Although `MyEvent` inherits from `FastEvent`, because `context` is a generic parameter that is not passed through to `FastEvent`, `context` becomes `never`.

So it needs to be modified as follows:

```ts twoslash
import { FastEvent, FastEventOptions } from 'fastevent'
interface MyEventOptions<M, C> extends FastEventOptions<M, C> {
    count?: number
}

class MyEvent<E extends Record<string, any> = Record<string, any>,
    M extends Record<string, any> = Record<string, any>,
    C = never
> extends FastEvent<E, M, C> {
    constructor(options?: Partial<MyEventOptions<M, C>>) {
        super(Object.assign({}, options))
    }
    get options() {
        return super.options as MyEventOptions<M, C>
    }
}

const emitter = new MyEvent({
    context: { a: 1 }
})
emitter.on('test', function (this, message) {
   type This = typeof this   // [!code ++]
   // This === {a:1}
})  
type OptionsType = typeof emitter.options
emitter.options.count = 100 
```
 
## Inheriting FastEventScope

`FastEventScope` is inherited in much the same way as `FastEvent`.

```ts twoslash
import { 
    FastEvent,
    FastEventScope,
    FastEventScopeOptions,OverrideOptions 
} from 'fastevent'

 type MyScopeEvents = {
    a: number
    b: string
    c: boolean
}
interface MyScopeOptions<M, C> extends FastEventScopeOptions<M, C> {
    count?: number
}

const emitter = new FastEvent({
    meta: {
        root: 100
    }
}) 

class MyScope<E extends Record<string, any> = MyScopeEvents,
    M extends Record<string, any> = Record<string, any>,
    C = never
> extends FastEventScope<E, M, C> {
    constructor(options?: Partial<MyScopeOptions<M, C>>) {
        super(Object.assign({}, options))
    }
    test(value: number) {
        return 100
    }
    get options() {
        return super.options as MyScopeOptions<M, C>
    }
}

const myScope = emitter.scope('modules/my', new MyScope())

myScope.on('a', function (this,message) {
    type This = typeof this   // [!code ++]
    message.meta
    message.type
    message.payload
})
```
