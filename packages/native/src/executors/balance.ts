import { IFastListenerExecutor } from "./types"

/**
 * 负载均衡执行器，用于在多个监听器中选择执行次数最少的进行调用
 * @param listeners 监听器列表
 * @param message 消息对象
 * @param args 参数列表
 * @param execute 执行函数
 * @returns 返回包含单个执行结果的数组
 * 
 * 执行策略:
 * 1. 遍历所有监听器,找出执行次数最少的监听器
 * 2. 由于监听器执行后会自动+1,因此先对所有监听器执行次数-1,以抵消后续的+1
 * 3. 只执行选中的监听器,其他监听器不执行
 */
export const balance = (): IFastListenerExecutor => {
    return (listeners, message, args, execute) => {
        // 找出listeners里面所有执行器的执行次数最少的项
        let count: number
        let index: number = 0
        listeners.forEach((listener, i) => {
            // 为什么所有监听器的执行次数均减1？
            // 因为监听器执行完毕后会自动+1，但是在balance执行器中，只有一个会监听器会执行，因此在此先减一用来抵消后续的+1
            listener[2]--
            if (count === undefined || count > listener[2]) {
                count = listener[2]
                index = i
            }
        })
        listeners[index][2]++
        return [execute(listeners[index][0], message, args)]
    }
}