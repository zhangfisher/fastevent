import { TypedFastEventMessage } from "../types"

export function isFastEventMessage(msg: any): msg is TypedFastEventMessage {
    if (!msg) return false
    return typeof (msg) === 'object' && 'type' in msg
}