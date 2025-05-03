import { TimeoutError } from "../consts"
import { FastEventListener, FastEventListenerArgs, FastEventMessage } from "../types"
import { FastListenerPipe } from "./types"

/**
 * 创建一个超时装饰器，限制监听器函数的执行时间
 * @param ms 超时时间（毫秒）
 * @param defaultValue 可选的默认返回值，如果提供则超时时返回此值，否则抛出TimeoutError
 * @returns 装饰器函数
 */
export const timeout = <T = any>(ms: number, defaultValue?: T): FastListenerPipe => {
    return (listener: FastEventListener): FastEventListener => {
        return async function (message: FastEventMessage, args: FastEventListenerArgs) {
            let timeoutId: any

            const timeoutPromise = new Promise((resolve, reject) => {
                timeoutId = setTimeout(() => {
                    if (defaultValue !== undefined) {
                        resolve(defaultValue)
                    } else {
                        reject(new TimeoutError())
                    }
                }, ms)
            })

            const listenerPromise = Promise.resolve(listener.call(this, message, args))

            try {
                return await Promise.race([listenerPromise, timeoutPromise])
            } finally {
                clearTimeout(timeoutId!)
            }
        }
    }
}