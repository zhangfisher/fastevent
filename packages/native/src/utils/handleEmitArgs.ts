import { FastEventListenerArgs, FastEventMessage, FastEvents } from "../types"

export function handleEmitArgs<
    Events extends FastEvents = FastEvents,
    Meta = unknown
>(args: IArguments, emitterMeta: any, scopeMeta?: any, scopeExecutor?: any): [FastEventMessage<Events, Meta>, FastEventListenerArgs<Meta>] {
    let type: string, payload: any, meta: any
    let emitArgs: FastEventListenerArgs<Meta> = {}

    if (typeof (args[0]) === 'object') {
        type = args[0].type as string
        payload = args[0].payload as any
        emitArgs = typeof (args[1]) === 'boolean' ? { retain: args[1] } : args[1] || {}
        meta = args[0].meta
    } else {
        type = args[0] as string
        payload = args[1] as any
        emitArgs = typeof (args[2]) === 'boolean' ? { retain: args[2] } : args[2] || {}
    }
    meta = Object.assign({}, emitterMeta, scopeMeta, emitArgs.meta, meta)

    if (Object.keys(meta).length === 0) meta = undefined

    const message = {
        type,
        payload,
        meta
    } as FastEventMessage<Events, Meta>

    if (emitArgs.executor === undefined) {
        emitArgs.executor = scopeExecutor
    }

    return [message, emitArgs]
}