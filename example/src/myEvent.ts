import { FastEvent } from "../../src/event";
import { FastEventOptions } from "../../src/types";

interface MyEvents {
    a: number
    b: string
    c: boolean
}
interface MyEventMeta {
    source: string
}


interface MyEventOptions extends FastEventOptions<MyEventMeta> {
    x: number
}

export class MyEvent extends FastEvent<MyEvents, MyEventMeta> {
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