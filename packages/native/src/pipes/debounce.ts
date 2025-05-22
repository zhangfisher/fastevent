import { TypedFastEventListener, FastEventListenerArgs, TypedFastEventMessage } from "../types"
import { FastListenerPipe } from "./types"

export interface DebounceOptions {
    /**
     * 当消息被丢弃时的回调函数
     */
    drop?: (message: TypedFastEventMessage) => void
}

/**
 * 创建一个防抖动装饰器，限制监听器函数的执行频率
 * @param ms 防抖动时间（毫秒）
 * @param options 可选的配置项
 * @returns 装饰器函数
 */
export const debounce = (ms: number, options?: DebounceOptions): FastListenerPipe => {
    return (listener: TypedFastEventListener): TypedFastEventListener => {
        let isBlocked = false
        let timeoutId: any = null

        return async function (message: TypedFastEventMessage, args: FastEventListenerArgs) {
            // 如果当前处于防抖动时间内，丢弃消息
            if (isBlocked) {
                if (options?.drop) {
                    options.drop(message)
                }
                return
            }

            try {
                // 设置阻塞标志
                isBlocked = true

                // 执行监听器
                const result = await listener.call(this, message, args)

                // 设置定时器，在ms毫秒后解除阻塞
                timeoutId = setTimeout(() => {
                    isBlocked = false
                    timeoutId = null
                }, ms)

                return result
            } catch (error) {
                isBlocked = false
                if (timeoutId) {
                    clearTimeout(timeoutId)
                    timeoutId = null
                }
                throw error
            }
        }
    }
}