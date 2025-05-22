import { TypedFastEventListener, FastEventListenerArgs, TypedFastEventMessage } from "../types"
import type { FastListenerPipe } from "./types"

/**
 * 创建一个memorize pipe，用于缓存上一次的返回值
 * @param predicate 可选的判断函数，用于决定是否使用缓存
 * @returns FastListenerPipe
 */
export function memorize(predicate?: (message: TypedFastEventMessage, args: FastEventListenerArgs) => boolean | Promise<boolean>): FastListenerPipe {
    let lastResult: any = undefined
    let hasResult = false
    let lastPayload: any = undefined
    let hasPredicate = typeof (predicate) === 'function'
    return function (listener: TypedFastEventListener): TypedFastEventListener {
        return async function (message: TypedFastEventMessage, args: FastEventListenerArgs) {
            if (hasResult) {
                // 如果有自定义判断函数，使用它来决定是否使用缓存
                if (typeof (predicate) === 'function') {
                    if (await predicate(message, args)) {
                        return lastResult
                    }
                } else {// 默认根据message.payload判断                
                    if (message.payload === lastPayload) {
                        return lastResult
                    }
                }
            }
            // 执行原始监听器并缓存结果
            const result = await listener.call(this, message, args)
            lastResult = result
            if (!hasPredicate) lastPayload = message.payload
            hasResult = true
            return result
        }
    }
}