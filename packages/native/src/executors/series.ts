import { TypedFastEventListener, FastEventListenerArgs, TypedFastEventMessage } from "../types"
import { isString } from "../utils"
import { isFunction } from "../utils/isFunction"
import { FastListenerExecutor } from "./types"


export type SeriesExecutorOptions = {
    reverse?: boolean    // 反向执行监听器
    /**
     * 控制监听器如何返回结果
     * 
     * 提供一个reduce函数对所有监听器返回结果进行reduce操作
     * series({
     *    onReturns: (result, cur)=>{
     *      if(!result) result = []
     *      return result.push(cur)
     *    }
     * })
     */
    onReturns?: (results: any, cur: any) => any
    // 当调用下一个监听器前执行,返回false或触发错误均不再执行后续的监听器
    // 可以在此修改message
    onNext?: (index: number, previous: any, message: TypedFastEventMessage, args: FastEventListenerArgs, results: any) => boolean
    // 当执行监听器出错时的回调，返回false中止后续执行
    onError?: 'skip' | 'abort' | 'error' | ((e: any, message: TypedFastEventMessage, args: FastEventListenerArgs) => void | 'skip' | 'abort' | 'error')
}

export const series = (options?: SeriesExecutorOptions): FastListenerExecutor => {
    const { reverse, onNext, onReturns, onError } = Object.assign({
        reverse: false,
        onError: () => { },
        onNext: () => true,
        onReturns: (_: any, cur: any) => cur
    }, options) as SeriesExecutorOptions
    return async (listeners, message, args, execute) => {
        let results: any = undefined
        let stepResult: any = undefined
        let index: number = 0
        // 全部执行次数-1
        listeners.forEach(listener => listener[2]--)
        for (let i = 0; i < listeners.length; i++) {
            const item = listeners[reverse ? listeners.length - 1 - i : i]
            const listener = item[0] as TypedFastEventListener<any, any, any>
            try {
                if (isFunction(onNext) && onNext(++index, stepResult, message, args, results) === false) {
                    break
                }
                stepResult = await execute(listener, message, args, false)
                if (isFunction(onReturns)) {
                    results = onReturns(results, stepResult)
                } else {
                    results = stepResult
                }
                // 实际执行次数+1
                item[2]++
            } catch (e: any) {
                try {
                    const behavior = isString(onError) ? onError : isFunction(onError) && onError!(e, message, args)
                    if (behavior === 'skip') {
                        continue
                    } else if (behavior === 'error') {
                        results = e
                        break
                    } else if (behavior === 'abort') {
                        break
                    }
                } catch { }
            }
        }
        return results
    }

}