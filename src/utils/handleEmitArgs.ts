import { FastEventMessage, FastEvents } from "../types"



export function handleEmitArgs<
    Events extends FastEvents = FastEvents,
    Meta = unknown
>(args: IArguments, scopeMeta: any): [FastEventMessage<Events, Meta>, boolean] {
    let type: string, payload: any, retain: boolean, meta: any
    if (typeof (args[0]) === 'object') {
        type = args[0].type as string
        payload = args[0].payload as any
        meta = args[0].meta === undefined && scopeMeta == undefined ? undefined : Object.assign({}, scopeMeta, args[0].meta)
        retain = args[1] as boolean
    } else {
        type = args[0] as string
        payload = args[1] as any
        retain = args[2] as boolean
        meta = args[3] === undefined && scopeMeta == undefined ? undefined : Object.assign({}, scopeMeta, args[3])
    }
    const message = {
        type,
        payload,
        meta
    } as FastEventMessage<Events, Meta>
    return [message, retain]
}