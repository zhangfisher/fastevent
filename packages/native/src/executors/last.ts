import { IFastListenerExecutor } from "./types"

/**
 * 执行监听器列表中的最后一个监听器
 * @param listeners - 监听器数组
 * @param message - 事件消息
 * @param args - 事件参数
 * @param execute - 执行器函数
 * @returns 返回包含最后一个监听器执行结果的数组
 */
export const last = (): IFastListenerExecutor => {
    return (listeners, message, args, execute) => {
        listeners.forEach(listener => listener[2]--)
        listeners[listeners.length - 1][2]++
        return [
            execute(listeners[listeners.length - 1][0], message, args)
        ]
    }
}