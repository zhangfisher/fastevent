import { FastEventListener, FastEventListenerArgs, TypedFastEventMessage } from "../types"
import { FastListenerPipe } from "./types"

export interface ThrottleOptions {
    /**
     * 当消息被丢弃时的回调函数
     */
    drop?: (message: TypedFastEventMessage) => void
}

/**
 * 创建一个节流装饰器，限制监听器函数的执行频率
 * @param interval 节流时间间隔（毫秒）
 * @param options 可选的配置项
 * @returns 装饰器函数
 */
export const throttle = (interval: number, options?: ThrottleOptions): FastListenerPipe => {
    return (listener: FastEventListener): FastEventListener => {
        let lastExecutionTime = 0

        return async function (message: TypedFastEventMessage, args: FastEventListenerArgs) {
            const now = Date.now()
            const timeSinceLastExecution = now - lastExecutionTime

            // 如果在节流时间内，则丢弃消息
            if (timeSinceLastExecution < interval) {
                if (options?.drop) {
                    options.drop(message)
                }
                return
            }

            // 更新最后执行时间并执行监听器
            lastExecutionTime = now
            return await listener.call(this, message, args)
        }
    }
}