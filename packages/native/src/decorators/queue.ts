import { QueueOverflowError } from "../consts"
import { FastEventListener, FastEventListenerArgs, FastEventMessage } from "../types"
import { FastListenerDecorator } from "./types"


export interface FastEventListenerDecorators {
    queue: string
}
export type FastQueueOverflows =
    "drop"              //     当缓冲区满时,丢弃新消息
    | "expand"          //     当缓冲区满时,扩展缓冲区，每次扩展size，直到缓冲区大小达到maxSize
    | 'slide'           //     当缓冲区满时,将缓冲区中的消息向前移动,丢弃旧的消息
    | 'throw'           //     当缓冲区满时,抛出异常

export type QueueListenerDecoratorOptions = {
    size?: number                         // 缓冲区默认大小
    maxExpandSize?: number                      //  缓冲区扩展到到多大时不再扩展
    expandOverflow?: Omit<FastQueueOverflows, 'expand'>
    overflow?: FastQueueOverflows
}


export const queue = (options?: QueueListenerDecoratorOptions): FastListenerDecorator => {
    const { size, overflow, maxExpandSize, expandOverflow } = Object.assign({
        size: 10,
        maxExpandSize: 100,
        overflow: 'expend',
        expandOverflow: 'slide'
    }, options)

    const buffer: FastEventMessage[] = []
    let currentSize = size      // 当前缓冲区大小
    let isHandling = false     // 是否正在处理缓冲区中的消息

    const handleOverflow = (message: FastEventMessage): boolean => {
        // 如果已达到最大大小且当前策略为expand，使用expandOverflow策略
        const strategy = (buffer.length >= maxExpandSize && overflow === 'expand') ? expandOverflow : overflow

        switch (strategy) {
            case 'drop':
                return false
            case 'expand':
                currentSize = Math.min(currentSize + size, maxExpandSize)
                buffer.push(message)
                return true
            case 'slide':
                buffer.shift() // 移除最旧的消息
                buffer.push(message)
                return true
            case 'throw':
                throw new QueueOverflowError()
            default:
                return false
        }
    }
    return (listener: FastEventListener): FastEventListener => {
        return async (message: FastEventMessage<any>, args: FastEventListenerArgs) => {
            if (isHandling) {
                // 如果正在处理消息，尝试将新消息添加到缓冲区
                if (buffer.length < currentSize) {
                    buffer.push(message)
                } else {
                    handleOverflow(message)
                }
                return
            }
            // 如果没有正在处理的消息，先处理当前消息
            isHandling = true
            try {
                await listener(message, args)
                // 处理缓冲区中的消息
                while (buffer.length > 0) {
                    const nextMessage = buffer.shift()
                    if (nextMessage) {
                        await listener(nextMessage, args)
                    }
                }
            } finally {
                isHandling = false
            }
        }
    }

}

export const dropping = (size: number = 10) => queue({ size, overflow: 'drop' })
export const sliding = (size: number = 10) => queue({ size, overflow: 'slide' })
export const expanding = (options?: Omit<QueueListenerDecoratorOptions, 'overflow'>) => queue(Object.assign({}, options, { overflow: 'expand' as QueueListenerDecoratorOptions['overflow'] }))