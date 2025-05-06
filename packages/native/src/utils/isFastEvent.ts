import { FastEvent } from "../event"


export function isFastEvent(target: any): target is FastEvent {
    if (!target) return false
    return typeof target === 'object' && '__FastEvent__' in target
}