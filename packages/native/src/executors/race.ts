import { FastListenerMeta } from "../types"
import { IFastListenerExecutor } from "./types"

/**
 * 竞态执行器 - 同时执行多个监听器,只返回最快完成的结果
 * 
 * @param listeners - 监听器元数据列表
 * @param message - 要处理的消息
 * @param args - 执行参数
 * @param execute - 执行函数
 * @returns 包含最快完成监听器结果的数组
 * 
 * @description
 * - 只有第一个完成的监听器结果会被返回
 * - 其他未完成的监听器会被中止
 * - 如果没有提供中止信号,会自动创建一个
 * - 胜出的监听器计数会被恢复
 */
export const race = (): IFastListenerExecutor => {
    return (listeners, message, args, execute) => {
        let winner: FastListenerMeta | undefined
        let abortController: AbortController | undefined
        if (!args || (args && !args.abortSignal)) {
            abortController = new AbortController()
            if (!args) args = {}
            args.abortSignal = abortController.signal
        }
        const result = Promise.race(listeners.map(listener => {
            listener[2]--
            return Promise.resolve(execute(listener[0], message, args)).then((result: any) => {
                if (!winner) {
                    winner = listener
                    listener[2]++
                }
                abortController?.abort()
                return result
            })
        }))
        return [
            result
        ]
    }
}