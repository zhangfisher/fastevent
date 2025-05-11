import { FastListenerExecutor } from "./types"

/**
 * 随机执行器 - 从监听器列表中随机选择一个监听器执行
 * 
 * @param listeners - 监听器列表，每个元素为 [监听器函数, 优先级, 执行次数] 的元组
 * @param message - 要处理的消息对象
 * @param args - 传递给监听器的额外参数
 * @param execute - 执行监听器的函数
 * @returns 返回包含执行结果的数组
 * 
 * @remarks
 * - 随机选择一个监听器执行
 * - 所有监听器的执行次数计数减1
 * - 被选中执行的监听器执行次数加1
 */
export const random = (): FastListenerExecutor => {
    return (listeners, message, args, execute) => {
        const index = Math.floor(Math.random() * listeners.length)
        listeners.forEach(listener => listener[2]--)
        listeners[index][2]++
        return [
            execute(listeners[index][0], message, args)
        ]
    }
}