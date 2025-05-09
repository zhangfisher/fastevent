import { FastEventMessage } from "../types"
import { series, SeriesExecutorOptions } from "./series"
import { IFastListenerExecutor } from "./types"

export type WaterfallExecutorOptions = Omit<SeriesExecutorOptions, 'onError' | 'onReturns' | 'onStep'>


/**
 * 创建一个瀑布流执行器，用于按顺序执行监听器，并将前一个监听器的结果传递给下一个监听器
 * 如果出错就不再执行后续的监听器
 * 
 * @param options - 执行器配置选项
 * @returns 返回一个 FastListener 执行器实例
 * 
 * @remarks
 * - 当任一监听器执行出错时，会中断后续监听器的执行
 * - 每个监听器的执行结果会作为下一个监听器的 payload 参数
 */
export const waterfall = (options?: WaterfallExecutorOptions): IFastListenerExecutor => {
    return series(Object.assign({}, options, {
        // 出错时不再执行后续的监听器
        onError: () => false,
        // 将结果作为payload传给下一个监听器
        onStep: (previous: any, message: FastEventMessage) => {
            message.payload = previous
        }
    }) as unknown as SeriesExecutorOptions)
}