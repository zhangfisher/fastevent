import { Expand, FastEventEmitMessage, FastEventOptions } from "../types"

export type FastEventBusMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = Expand<FastEventEmitMessage<Events, M> & {
    from?: string
    to?: string
}>

export type FastEventBusOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export interface FastEventBusEvents {
    '$connect': string
    '$disconnect': string
}
export interface FastEventBusBroadcastEvents {

}

export interface FastEventBusNodes {

}