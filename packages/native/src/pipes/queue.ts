import { QueueOverflowError } from "../consts"
import { FastEventListener, FastEventListenerArgs, FastEventMessage } from "../types"
import { isFunction } from "../utils/isFunction"
import { FastListenerPipe } from "./types"


export interface FastEventListenerDecorators {
    queue: string
}
export type FastQueuePriority = 'none'

export type FastQueueOverflows =
    "drop"              // 当缓冲区满时,丢弃新消息
    | "expand"          // 当缓冲区满时,扩展缓冲区，每次扩展size，直到缓冲区大小达到maxSize
    | 'slide'           // 当缓冲区满时,将缓冲区中的消息向前移动,丢弃旧的消息
    | 'throw'           // 当缓冲区满时,抛出异常

export type QueueListenerPipeOptions = {
    size?: number                         // 缓冲区默认大小
    maxExpandSize?: number                      //  缓冲区扩展到到多大时不再扩展
    expandOverflow?: Omit<FastQueueOverflows, 'expand'>
    overflow?: FastQueueOverflows
    // =0不启用此机制，当消息在队列中的时间到达lifetime（ms）后，自动丢弃
    lifetime?: number
    // 当新消息到达时触发此回调，可以用来处理新消息，转让默认是采用push操作
    onPush?: (newMessage: FastEventMessage, messages: [FastEventMessage, number][]) => void
    // 当消息被弹出时触发此回调，可以在此消息队列进行排序等操作
    // hasNew: 自上次pop弹出消息后，是否有新的消息入列
    onPop?: (messages: [FastEventMessage, number][], hasNew: boolean) => [FastEventMessage, number] | undefined
    // 当消息被丢弃时触发此回调
    onDrop?: (message: FastEventMessage) => void
}


export const queue = (options?: QueueListenerPipeOptions): FastListenerPipe => {
    const { lifetime, size, overflow, maxExpandSize, expandOverflow, onPush, onDrop, onPop } = Object.assign({
        size: 10,
        maxExpandSize: 100,
        overflow: 'expand',
        expandOverflow: 'slide',
        lifetime: 0
    }, options)

    let buffer: [FastEventMessage, number][] = []
    let currentSize = size      // 当前缓冲区大小
    let isHandling = false     // 是否正在处理缓冲区中的消息
    let hasNewMessage: boolean = false

    const pushMessage = (message: FastEventMessage) => {
        if (isFunction(onPush)) {
            onPush(message, buffer)
        } else {
            buffer.push(lifetime > 0 ? [message, Date.now()] : [message, 0])
        }
    }

    const handleOverflow = (message: FastEventMessage): boolean => {
        // 如果已达到最大大小且当前策略为expand，使用expandOverflow策略
        const strategy = (buffer.length >= maxExpandSize && overflow === 'expand') ? expandOverflow : overflow
        switch (strategy) {
            case 'drop':
                if (isFunction(onDrop)) onDrop(message)
                return false
            case 'expand':
                currentSize = Math.min(currentSize + size, maxExpandSize)
                pushMessage(message)
                return true
            case 'slide':
                const msg = buffer.shift() // 移除最旧的消息
                if (isFunction(onDrop) && msg) onDrop(msg[0])
                pushMessage(message)
                return true
            case 'throw':
                if (isFunction(onDrop)) onDrop(message)
                throw new QueueOverflowError()
            default:
                return false
        }
    }
    return (listener: FastEventListener): FastEventListener => {
        return async function (message: FastEventMessage<any>, args: FastEventListenerArgs) {
            hasNewMessage = true
            if (isHandling) {
                // 如果正在处理消息，尝试将新消息添加到缓冲区
                if (buffer.length < currentSize) {
                    pushMessage(message)
                } else {
                    handleOverflow(message)
                }
                return
            }
            // 如果没有正在处理的消息，先处理当前消息
            isHandling = true
            try {
                await listener.call(this, message, args)
                // 处理缓冲区中的消息
                while (buffer.length > 0) {
                    let nextMessage, enterTime
                    // 从队列中弹出消息进行处理
                    if (hasNewMessage && isFunction(onPop)) {
                        [nextMessage, enterTime] = onPop(buffer, hasNewMessage) || [undefined, 0]
                        hasNewMessage = false
                    } else {
                        [nextMessage, enterTime] = buffer.shift() || [undefined, 0]
                    }
                    if (nextMessage) {
                        // 如果消息在缓冲区中停留的时间超过lifetime，丢弃该消息
                        if (lifetime > 0 && Date.now() - enterTime > lifetime) {
                            if (isFunction(onDrop)) onDrop(nextMessage)
                            continue
                        }
                        await listener.call(this, nextMessage, args)
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
export const expanding = (options?: Omit<QueueListenerPipeOptions, 'overflow'>) => queue(Object.assign({}, options, { overflow: 'expand' as QueueListenerPipeOptions['overflow'] }))