import { FastEventEmitMessage, FastEventOptions } from "../types"

export type FastEventBusNodeMessage<T extends FastEventEmitMessage = FastEventEmitMessage> = T & {
    from?: string
    to?: string
}

export type FastEventBusOptions = FastEventOptions

export interface FastEventBusEvents {
    'node:connect': string
    'node:disconnect': string
}
export const NamespaceDelimiter = '::'
