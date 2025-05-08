import { Expand, FastEventEmitMessage, FastEventOptions } from "../types"

export type FastEventBusMessage<T extends FastEventEmitMessage = FastEventEmitMessage> = Expand<T & {
    from?: string
    to?: string
}>

export type FastEventBusOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export interface FastEventBusEvents {
    'node:broadcast': string
    'node:connect': string
    'node:disconnect': string
}

export interface FastEventBusNodes {

}