import { FastEventMessage } from "../types"

export function isFastEventMessage(msg: any): msg is FastEventMessage {
    if (!msg) return false
    return typeof (msg) === 'object' && 'type' in msg
}