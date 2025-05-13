import { FastEventEmitMessage, FastEventOptions } from "../types"

export type FastEventBusMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = FastEventEmitMessage<Events, M> & {
    from?: string
    to?: string
}

export type FastEventBusOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export interface FastEventBusEvents {
    '$connect': string
    '$disconnect': string
    'data': any               // 默认广播事件
}

export type FastEventBusEventTypes = keyof FastEventBusEvents


export interface FastEventBusNodes {

}
export type FastEventBusNodeIds = keyof FastEventBusNodes