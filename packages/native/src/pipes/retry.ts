import { FastEventListener, FastEventListenerArgs, TypedFastEventMessage } from "../types"
import { isFunction } from "../utils/isFunction"
import { FastListenerPipe } from "./types"

export interface RetryListenerPipeOptions {
    interval?: number | ((retryCount: number) => number) // 重试间隔，默认1000ms
    drop?: (message: TypedFastEventMessage, error: Error) => void // 所有重试失败后的回调
}

/**
 * 创建一个重试管道，在监听器执行失败时自动重试
 * @param count 最大重试次数
 * @param options 配置选项
 * @returns FastListenerPipe
 */
export const retry = (count: number, options?: RetryListenerPipeOptions): FastListenerPipe => {
    const { interval = 1000, drop } = options || {}

    return (listener: FastEventListener): FastEventListener => {
        return async function (message: TypedFastEventMessage, args: FastEventListenerArgs) {
            let retries = 0
            let lastError: Error | undefined
            while (retries <= count) {
                try {
                    return await listener.call(this, message, args)
                } catch (error) {
                    lastError = error as Error
                    if (retries < count) {
                        // 等待interval后重试
                        await new Promise(resolve => {
                            setTimeout(resolve, isFunction(interval) ? interval(retries) : interval)
                        })
                        retries++
                    } else {
                        // 所有重试失败，调用drop回调
                        if (isFunction(drop)) {
                            drop(message, lastError)
                        }
                        throw lastError
                    }
                }
            }
        }
    }
}