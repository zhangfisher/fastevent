import { FastEventEmitMessage, FastEventOptions } from "../types"

export type FastEventBusNodeMessage<T extends FastEventEmitMessage = FastEventEmitMessage> = T & {
    from?: string
    to?: string
}

export type FastEventBusOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export interface FastEventBusEvents {
    'node:connect': string
    'node:disconnect': string
}
export const NamespaceDelimiter = '::'
