# 类继承

`FastEvent`提供了`FastEvent`和`FastEventScope`两个类，除了独立创建实例外，也可以通过继承的方式创建。


## 继承FastEvent

```ts twoslash
import { FastEvent, FastEventOptions,OverrideOptions } from 'fastevent'
interface MyEventOptions extends FastEventOptions {
    count?: number
}
class MyEvent extends FastEvent {
    constructor(options?: Partial<MyEventOptions>) {
        super(Object.assign({}, options))
    }
    get options() {
        return super.options as OverrideOptions<MyEventOptions> // [!code ++]
    }
}

const emitter = new MyEvent()
emitter.on('test', function (this, message) {
   type This = typeof this   // [!code ++]
})  
type OptionsType = typeof emitter.options
emitter.options.count = 100
```

- 以上`MyEvent`继承了`FastEvent`，并且重载了`Options`选项，重载时需要使用`OverrideOptions<T>`对类型进行重定义。

**当创建`FastEvent`实例时，如何传入`context`参数，则情况有些不一样。**

```ts twoslash
import { FastEvent, FastEventOptions,OverrideOptions } from 'fastevent'
interface MyEventOptions extends FastEventOptions {
    count?: number
}
class MyEvent extends FastEvent {
    constructor(options?: Partial<MyEventOptions>) {
        super(Object.assign({}, options))
    }
    get options() {
        return super.options as OverrideOptions<MyEventOptions> // [!code ++]
    }
}

const emitter = new MyEvent({
    context: { a: 1 }
})
emitter.on('test', function (this, message) {
   type This = typeof this   // [!code error]
   // This !== {a:1}
})  
type OptionsType = typeof emitter.options
emitter.options.count = 100 
```

**为什么监听器函数的`this`类型不是`{a:1}`呢？**

因为`MyEvent`虽然继承了`FastEvent`，但是没有为`options.context`提供泛型推断。

所以需要修改如下：

```ts twoslash
import { FastEvent, FastEventOptions,OverrideOptions } from 'fastevent'
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
        return super.options as OverrideOptions<MyEventOptions<M, C>>
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
 
## 继承FastEventScope

`FastEventScope`的继承方式与`FastEvent`基本类似。

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
        return super.options as OverrideOptions<MyScopeOptions<M, C>>
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
