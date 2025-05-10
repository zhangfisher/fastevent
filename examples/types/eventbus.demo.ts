import { FastEventBus } from "../../packages/native/src/eventbus/eventbus"

// ------------------- FastEventBus -------------------
const bus = new FastEventBus<{
    join: string
}>()

// ✅✅✅ 正确 ✅✅✅
bus.emit('$connect', "dd")
bus.emit('$disconnect', "dd")
bus.emit({
    type: '$connect',
    payload: 'done'
})
bus.emit({
    type: '$disconnect',
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
bus.emit('$connect', 1)
bus.emit('$disconnect', 1)
bus.emit('join', 1)
bus.emit({
    type: '$connect',
    payload: 1
})
bus.emit({
    type: '$disconnect',
    payload: 1
})
bus.emit({
    type: 'join',
    payload: 1
})