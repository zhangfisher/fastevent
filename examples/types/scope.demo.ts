import { FastEvent, FastEventListener } from "../../packages/native/src";

type CustomEvents = {
    a: boolean
    b: number
    c: string
}
const emitter = new FastEvent();
const listener = (({ type }) => {
    anyEvents.push(type)
}) as FastEventListener

emitter.onAny(listener)

const scope = emitter.scope<{
    x: number,
    y: string
}>("a/b/c")

scope.on('x', (message) => {
    anyEvents.push(message.type)
})

const dScope = scope.scope("d") // a/b/c/d
dScope.onAny(listener)

const eScope = scope.scope("e")// a/b/c/e
eScope.onAny(listener)

const fScope = scope.scope("f")// a/b/c/f
fScope.onAny(listener)

const anyEvents: string[] = []
emitter.emit("root", 1)
scope.emit("c", 1)
dScope.emit("d", 1)
eScope.emit("e", 1)
fScope.emit("f", 1)
