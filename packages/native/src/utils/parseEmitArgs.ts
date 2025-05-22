import { FastEventListenerArgs, TypedFastEventMessage } from "../types"

export function parseEmitArgs<
    Events extends Record<string, any> = Record<string, any>,
    Meta = unknown
>(args: IArguments, emitterMeta: any, scopeMeta?: any, scopeExecutor?: any): [TypedFastEventMessage<Events, Meta>, FastEventListenerArgs<Meta>] {
    let meta: any
    let emitArgs: FastEventListenerArgs<Meta> = {}
    let message = {} as TypedFastEventMessage<Events, Meta>
    if (typeof (args[0]) === 'object') {
        Object.assign(message, args[0])
        emitArgs = typeof (args[1]) === 'boolean' ? { retain: args[1] } : args[1] || {}
        meta = args[0].meta
    } else {
        message.type = args[0] as any
        message.payload = args[1] as any
        emitArgs = typeof (args[2]) === 'boolean' ? { retain: args[2] } : args[2] || {}
    }
    meta = Object.assign({}, emitterMeta, scopeMeta, emitArgs.meta, meta)

    if (Object.keys(meta).length === 0) meta = undefined
    message.meta = meta

    if (emitArgs.executor === undefined) {
        emitArgs.executor = scopeExecutor
    }

    return [message, emitArgs]
}