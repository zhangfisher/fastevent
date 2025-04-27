import { FastEventMessage, FastEvents, FastEventEmitOptions } from "../types"

export function handleEmitArgs<
    Events extends FastEvents = FastEvents,
    Meta = unknown
>(args: IArguments, emitterScope: any, scopeMeta?: any): [FastEventMessage<Events, Meta>, FastEventEmitOptions<Meta>] {
    let type: string, payload: any, meta: any
    let emitOptions: FastEventEmitOptions<Meta> = {}

    if (typeof (args[0]) === 'object') {
        type = args[0].type as string
        payload = args[0].payload as any
        emitOptions = args[1] || {}
    } else {
        type = args[0] as string
        payload = args[1] as any
        emitOptions = args[2] || {}
    }
    meta = Object.assign({}, emitterScope, scopeMeta, emitOptions.meta)
    if (Object.keys(meta).length === 0) meta = undefined

    const message = {
        type,
        payload,
        meta
    } as FastEventMessage<Events, Meta>

    if (meta !== undefined) {
        emitOptions.meta = meta
    }

    return [message, emitOptions]
}