import type { FastEventScope } from "../scope"

export function isFastEventScope(target: any): target is FastEventScope {
    if (!target) return false
    return typeof target === 'object' && '__FastEventScope__' in target
}