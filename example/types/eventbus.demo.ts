import { FastEventBus } from "../../packages/native/src/eventbus/eventbus"

// ------------------- FastEventBus -------------------
const bus = new FastEventBus<{
    join: string
}>()

// ✅✅✅ 正确 ✅✅✅
bus.emit('node:connect', "dd")
bus.emit('node:disconnect', "dd")
bus.emit({
    type: 'node:connect',
    payload: 'done'
})
bus.emit({
    type: 'node:disconnect',
    payload: 'done'
})
bus.emit('join', 'done')
bus.emit({
    type: 'join',
    payload: 'done'
})
bus.emit('11111')
bus.emit("x", 1)

// ❌❌❌ 错误 ❌❌❌
bus.emit('node:connect', 1)
bus.emit('node:disconnect', 1)
bus.emit('join', 1)
bus.emit({
    type: 'node:connect',
    payload: 1
})
bus.emit({
    type: 'node:disconnect',
    payload: 1
})
bus.emit({
    type: 'join',
    payload: 1
})