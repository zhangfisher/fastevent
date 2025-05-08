# 类继承

`FastEvent`提供了`FastEvent`和`FastEventScope`两个类，除了独立创建外，也可以通过继承的方式创建。


## 继承FastEvent

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
        return super.options as unknown as ChangeFieldType<Required<MyEventOptions>, 'context', never>
    }
}
// 未指定Context
const myemitter1 = new MyEvent()
myemitter1.on('test', function (this, message) {
    type cases = [
        Expect<Equal<typeof this, MyEvent>>,
        Expect<Equal<typeof message.type, 'test'>>
    ]
})
// 指定了Context
const myemitter2 = new MyEvent({
    context: { a: 1 }
})
myemitter2.on('test', function (this, message) {
    type cases = [
        // 没有指向{a:1}，因为没有传递泛型参数
        Expect<Equal<typeof this, MyEvent>>,
        Expect<Equal<typeof message.type, 'test'>>
    ]
})
```

## 继承FastEventScope