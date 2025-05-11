import { FastListenerExecutor } from "./types"

/**
 * 执行第一个监听器的执行器函数
 * 
 * @param listeners - 监听器数组，每个元素是一个包含监听器函数的元组
 * @param message - 要传递给监听器的消息对象
 * @param args - 要传递给监听器的额外参数
 * @param execute - 执行监听器的函数
 * @returns 返回一个数组，包含第一个监听器的执行结果
 */
export const first = (): FastListenerExecutor => {
    return (listeners, message, args, execute) => {
        listeners.forEach(listener => listener[2]--)
        listeners[0][2]++
        return [
            execute(listeners[0][0], message, args)
        ]
    }
}