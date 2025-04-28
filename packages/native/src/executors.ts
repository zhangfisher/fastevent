import { FastListenerMeta, IFastListenerExecutor } from "./types"

export const allSettled: IFastListenerExecutor = (listeners, message, args, execute) => {
    return Promise.allSettled(listeners.map(listener => execute(listener[0], message, args)))
}

export const race: IFastListenerExecutor = (listeners, message, args, execute) => {
    let winner: FastListenerMeta | undefined
    const result = Promise.race(listeners.map(listener => {
        listener[2]--
        return Promise.resolve(execute(listener[0], message, args)).then((result: any) => {
            if (!winner) {
                winner = listener
                listener[2]++
            }
            return result
        })
    }))
    return [
        result
    ]
}

/**
 * 负载均衡执行器
 * 
 * 不像其他执行器，只执行所有监听器中执行次数最少的那个
 * 
 * @param listeners FastListenerMeta
 * @returns Promise 最先完成的监听器的执行结果
 */
export const balance: IFastListenerExecutor = (listeners, message, args, execute) => {
    // 找出listeners里面所有执行器的执行次数最少的项
    let count: number
    let index: number = 0
    listeners.forEach((listener, i) => {
        // 为什么所有监听器的执行次数均减1？
        // 因为监听器执行完毕后会自动+1，但是在balance执行器中，只有一个会监听器会执行，因此在此先减一用来抵消后续的+1
        listener[2]--
        if (count == undefined || count > listener[2]) {
            count = listener[2]
            index = i
        }
    })
    listeners[index][2]++
    return [execute(listeners[index][0], message, args)]
}

/**
 * 执行第一个监听器的执行器函数
 * 
 * @param listeners - 监听器数组，每个元素是一个包含监听器函数的元组
 * @param message - 要传递给监听器的消息对象
 * @param args - 要传递给监听器的额外参数
 * @param execute - 执行监听器的函数
 * @returns 返回一个数组，包含第一个监听器的执行结果
 */
export const first: IFastListenerExecutor = (listeners, message, args, execute) => {
    listeners.forEach(listener => listener[2]--)
    listeners[0][2]++
    return [
        execute(listeners[0][0], message, args)
    ]
}

/**
 * 执行监听器列表中的最后一个监听器
 * @param listeners - 监听器数组
 * @param message - 事件消息
 * @param args - 事件参数
 * @param execute - 执行器函数
 * @returns 返回包含最后一个监听器执行结果的数组
 */
export const last: IFastListenerExecutor = (listeners, message, args, execute) => {
    listeners.forEach(listener => listener[2]--)
    listeners[listeners.length - 1][2]++
    return [
        execute(listeners[listeners.length - 1][0], message, args)
    ]
}

export const random: IFastListenerExecutor = (listeners, message, args, execute) => {
    const index = Math.floor(Math.random() * listeners.length)
    listeners.forEach(listener => listener[2]--)
    listeners[index][2]++
    return [
        execute(listeners[index][0], message, args)
    ]
}