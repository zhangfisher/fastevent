import { FastEventSubscriber } from "../types";

export function isSubsctiber(val: any): val is FastEventSubscriber {
    return val
        && typeof (val) === 'object'
        && 'off' in val
        && 'listener' in val
}