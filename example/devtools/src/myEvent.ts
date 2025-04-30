import { FastEvent } from "../../src/event";
import { FastEventMessage, FastEventOptions } from "../../src/types";

interface MyEvents {
    a: number
    b: string
    c: boolean
}
interface MyEventMeta {
    source: string
}

type MyEventOptions = FastEventOptions<MyEventMeta> & {
    x: number
}

type MyEventMessage = FastEventMessage<MyEvents, MyEventMeta> & {
    source: 'a' | 'b' | 'c'
}


export class MyEvent extends FastEvent<MyEvents, MyEventMessage> {
    constructor(options?: MyEventOptions) {
        super(options)
    }
    get options() {
        return super.options as MyEventOptions
    }
}

const emitter = new MyEvent()

emitter.options.x = 100
emitter.options.meta = {
    source: 'test'
}

emitter.on("a", (message) => {
    console.log(message)
})



export class MyEvent2 extends FastEvent<MyEvents> {
    constructor(options?: MyEventOptions) {
        super(options)
    }
    get options() {
        return super.options as MyEventOptions
    }
}
const emitter2 = new MyEvent2()

emitter2.options.x = 100
emitter2.options.meta = {
    source: 'test'
}

emitter2.on("a", (message) => {
    message.type = 'b'
    console.log(message)
})

