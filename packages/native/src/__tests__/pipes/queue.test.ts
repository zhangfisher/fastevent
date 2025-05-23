import { describe, expect, vi, beforeEach, afterEach, test } from "vitest"
import { FastEvent } from "../../event"
import { queue } from "../../pipes/queue"
import { QueueOverflowError } from "../../consts"

describe("监听器Pipe操作: Queue", () => {
    let emitter: FastEvent

    beforeEach(() => {
        emitter = new FastEvent()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    describe("Queue is not overflow", () => {
        test("size=5时应该正确处理所有消息", () => {
            const results: number[] = []
            emitter.on("test", async (msg) => {
                // 每个消息处理时间不同
                await delay(Math.floor((Math.random() * 100)))
                results.push(msg.payload)
            }, {
                pipes: [queue({ size: 5 })]
            })

            const promises = [
                ...emitter.emit("test", 1),
                ...emitter.emit("test", 2),
                ...emitter.emit("test", 3),
                ...emitter.emit("test", 4),
                ...emitter.emit("test", 5)
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 2, 3, 4, 5])
                }).finally(() => {
                    resolve()
                })

            })
        })

        test("size=10时应该正确处理所有消息", () => {
            const results: number[] = []
            emitter.on("test", async (msg) => {
                await delay(Math.floor((Math.random() * 10)))
                results.push(msg.payload)
            }, {
                pipes: [queue({ size: 10 })]
            })
            const length = 10
            const promises: any[] = []
            for (let i = 1; i <= length; i++) {
                promises.push(...emitter.emit("test", i))
            }

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual(Array.from({ length }, (_, i) => i + 1))
                }).finally(() => {
                    resolve()
                })
            })
        })
    })
    // 使用Promise包装setTimeout，配合vi.advanceTimersByTime使用
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
    describe("Queue is overflow", () => {
        test("超出缓冲区时应该根据slide策略处理消息并触发onDrop回调", () => {
            const droppedMessages: number[] = []
            const results: number[] = []
            let first: boolean = true
            // 不传入任何配置，使用默认值
            emitter.on("test", async (msg) => {
                await delay(first ? 1000 : 10)  // 每个消息处理时间50ms
                first = false
                results.push(msg.payload)
            }, {
                pipes: [
                    queue({
                        size: 3,
                        overflow: 'slide',
                        onDrop: (msg) => droppedMessages.push(msg.payload)
                    })]
            })

            // 快速发送11个消息
            // - 第1个消息直接处理
            // - 接下来10个消息进入缓冲区（默认大小为10）
            // - 第12个消息由于缓冲区已满，根据slide策略会替换掉最早进入缓冲区的消息
            const promises = [
                ...emitter.emit("test", 1),   // 马上处理
                ...emitter.emit("test", 2),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 3),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 4),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 5),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 6),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 7),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 8),   // 进入缓冲区,然后slide掉
                ...emitter.emit("test", 9),   // 进入缓冲区
                ...emitter.emit("test", 10),  // 进入缓冲区
                ...emitter.emit("test", 11),  // 进入缓冲区
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 9, 10, 11])
                    expect(droppedMessages).toEqual([2, 3, 4, 5, 6, 7, 8])  // 验证被丢弃的消息
                }).finally(() => {
                    resolve()
                })
            })
        })
        test("当缓冲区满时应该drop消息并触发onDrop回调", () => {
            const droppedMessages: number[] = []
            const results: number[] = []
            let first: boolean = true
            emitter.on("test", async (msg) => {
                await delay(first ? 500 : 10)  // 每个消息处理时间50ms
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({ size: 3, overflow: 'drop', onDrop: (msg) => droppedMessages.push(msg.payload) })],

            })

            const promises = [
                ...emitter.emit("test", 1),   // 马上处理
                ...emitter.emit("test", 2),   // 进入缓冲区
                ...emitter.emit("test", 3),   // 进入缓冲区
                ...emitter.emit("test", 4),   // 进入缓冲区
                ...emitter.emit("test", 5),   // 缓冲区满,丢弃
                ...emitter.emit("test", 6),   // 缓冲区满,丢弃
                ...emitter.emit("test", 7),   // 缓冲区满,丢弃
                ...emitter.emit("test", 8),   // 缓冲区满,丢弃
                ...emitter.emit("test", 9),   // 缓冲区满,丢弃
                ...emitter.emit("test", 10),  // 缓冲区满,丢弃
                ...emitter.emit("test", 11),  // 缓冲区满,丢弃
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 2, 3, 4])
                    expect(droppedMessages).toEqual([5, 6, 7, 8, 9, 10, 11])  // 验证被丢弃的消息
                }).finally(() => {
                    resolve()
                })
            })
        })
        test("当缓冲区满时应该throw并触发onDrop回调", () => {
            const droppedMessages: number[] = []
            const results: number[] = []
            let first: boolean = true
            emitter.on("test", async (msg) => {
                await delay(first ? 500 : 10)
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({ size: 3, overflow: 'throw', onDrop: (msg) => droppedMessages.push(msg.payload) })],

            })

            const promises = [
                ...emitter.emit("test", 1),   // 马上处理
                ...emitter.emit("test", 2),   // 进入缓冲区
                ...emitter.emit("test", 3),   // 进入缓冲区
                ...emitter.emit("test", 4),   // 进入缓冲区
                ...emitter.emit("test", 5),   // 缓冲区满,throw
                ...emitter.emit("test", 6),   // 缓冲区满,throw
                ...emitter.emit("test", 7),   // 缓冲区满,throw            
            ]
            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.allSettled(promises).then(emitResults => {
                    expect((emitResults[4] as any).value).toBeInstanceOf(QueueOverflowError)
                    expect((emitResults[5] as any).value).toBeInstanceOf(QueueOverflowError)
                    expect((emitResults[6] as any).value).toBeInstanceOf(QueueOverflowError)
                    expect(results).toEqual([1, 2, 3, 4])
                }).finally(() => {
                    resolve()
                })
            })
        })

    })

    describe("Queue with hooks", () => {
        test("通过onPush实现消息按优先级顺序处理", () => {
            const results: number[] = []
            let first: boolean = true
            emitter.on("test", async (msg) => {
                await delay(first ? 500 : 10)  // 每个消息处理时间相同
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 5,
                    onPush: (newMsg, queuedMsgs) => {
                        // 根据priority排序，高优先级（数字大）的排在前面
                        const insertIndex = queuedMsgs.findIndex(
                            msg => (msg[0].meta.priority ?? 0) < (newMsg.meta.priority ?? 0)
                        )
                        queuedMsgs.splice(insertIndex, 0, [newMsg, 0])
                    }
                })]
            })

            // 发送不同优先级的消息
            const promises = [
                ...emitter.emit("test", 1, { meta: { priority: 1 } }),   //  
                ...emitter.emit("test", 2, { meta: { priority: 1 } }),   //  低
                ...emitter.emit("test", 3, { meta: { priority: 3 } }),   //  
                ...emitter.emit("test", 4, { meta: { priority: 2 } }),   //  
                ...emitter.emit("test", 5, { meta: { priority: 5 } }),   //  
                ...emitter.emit("test", 6, { meta: { priority: 4 } }),   //  高
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    // 验证消息按优先级顺序处理： 
                    // 第1条消息因为还没有入列，所以先得到处理
                    expect(results).toEqual([1, 5, 6, 3, 4, 2])
                }).finally(() => {
                    resolve()
                })
            })
        })
        test("通过onPop实现根据消息优先级顺序处理", () => {
            const results: number[] = []
            let first: boolean = true
            emitter.on("test", async (msg) => {
                await delay(first ? 500 : 10)  // 每个消息处理时间相同
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 5,
                    onPop: (queuedMsgs, hasNew) => {
                        // 自上次pop之后是否有新消息 ，如果有则按优先级重新排序
                        if (hasNew) {
                            const sortedMsgs = queuedMsgs.sort(([msg1], [msg2]) => {
                                return (msg2.meta.priority ?? 0) - (msg1.meta.priority ?? 0)
                            })
                            queuedMsgs.splice(0, queuedMsgs.length, ...sortedMsgs)
                        }
                        return queuedMsgs.shift()
                    }
                })
                ]
            })

            // 发送不同优先级的消息
            const promises = [
                ...emitter.emit("test", 1, { meta: { priority: 1 } }),   //  
                ...emitter.emit("test", 2, { meta: { priority: 1 } }),   //  低
                ...emitter.emit("test", 3, { meta: { priority: 3 } }),   //  
                ...emitter.emit("test", 4, { meta: { priority: 2 } }),   //  
                ...emitter.emit("test", 5, { meta: { priority: 5 } }),   //  
                ...emitter.emit("test", 6, { meta: { priority: 4 } }),   //  高
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    // 验证消息按优先级顺序处理： 
                    // 第1条消息因为还没有入列，所以先得到处理
                    expect(results).toEqual([1, 5, 6, 3, 4, 2])
                }).finally(() => {
                    resolve()
                })
            })
        })
    })

    describe("Queue with overflow=expand", () => {

        test("应该在达到maxExpandSize时切换到drop策略", () => {
            const results: number[] = []
            let first: boolean = true
            // 设置初始缓冲区大小为2，使用expand策略，最大扩展到4
            emitter.on("test", async (msg) => {
                await delay(first ? 1000 : 20)
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 2,           // 初始缓冲区大小为2
                    overflow: "expand", // 使用expand策略
                    expandOverflow: 'drop',
                    maxExpandSize: 4    // 最大扩展到4
                })]
            })

            // 发送第一个消息并等待开始处理
            const promises = [
                ...emitter.emit("test", 1),  // 马上开始处理
                ...emitter.emit("test", 2),  // 进入缓冲区，大小=1
                ...emitter.emit("test", 3),  // 进入缓冲区，大小=2
                ...emitter.emit("test", 4),  // 触发扩展，大小=3
                ...emitter.emit("test", 5),  // 达到最大扩展，大小=4
                ...emitter.emit("test", 6),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 7),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 8),  // 超出maxExpandSize，应该被丢弃
            ]
            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 2, 3, 4, 5])  // 消息6, 7, 8被丢弃
                }).finally(() => {
                    resolve()
                })
            })
        })
        test("应该在达到maxExpandSize时切换到slide策略", () => {
            const results: number[] = []
            let first: boolean = true
            // 设置初始缓冲区大小为2，使用expand策略，最大扩展到4
            emitter.on("test", async (msg) => {
                await delay(first ? 1000 : 20)
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 2,           // 初始缓冲区大小为2
                    overflow: "expand", // 使用expand策略
                    // expandOverflow: 'slide',  默认
                    maxExpandSize: 4    // 最大扩展到4
                })]
            })

            // 发送第一个消息并等待开始处理
            const promises = [
                ...emitter.emit("test", 1),  // 马上开始处理
                ...emitter.emit("test", 2),  // 进入缓冲区，大小=1
                ...emitter.emit("test", 3),  // 进入缓冲区，大小=2
                ...emitter.emit("test", 4),  // 触发扩展，大小=3
                ...emitter.emit("test", 5),  // 达到最大扩展，大小=4
                ...emitter.emit("test", 6),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 7),  // 超出maxExpandSize，应该被丢弃
                ...emitter.emit("test", 8),  // 超出maxExpandSize，应该被丢弃
            ]
            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 5, 6, 7, 8])  // 消息2, 3, 4被丢弃
                }).finally(() => {
                    resolve()
                })
            })
        })
        test("应该在达到maxExpandSize时切换到throw策略", () => {
            const results: number[] = []
            let first: boolean = true
            // 设置初始缓冲区大小为2，使用expand策略，最大扩展到4
            emitter.on("test", async (msg) => {
                await delay(first ? 1000 : 20)
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 2,           // 初始缓冲区大小为2
                    overflow: "expand", // 使用expand策略
                    expandOverflow: 'throw',
                    maxExpandSize: 4    // 最大扩展到4
                })]
            })

            // 发送第一个消息并等待开始处理
            const promises = [
                ...emitter.emit("test", 1),  // 马上开始处理
                ...emitter.emit("test", 2),  // 进入缓冲区，大小=1
                ...emitter.emit("test", 3),  // 进入缓冲区，大小=2
                ...emitter.emit("test", 4),  // 触发扩展，大小=3
                ...emitter.emit("test", 5),  // 达到最大扩展，大小=4
                ...emitter.emit("test", 6),  // 超出maxExpandSize，throw Error
                ...emitter.emit("test", 7),  // 超出maxExpandSize，throw Error
                ...emitter.emit("test", 8),  // 超出maxExpandSize，throw Error
            ]

            return new Promise<void>((resolve, reject) => {
                vi.runAllTimersAsync()
                Promise.allSettled(promises).then(emitResults => {
                    try {
                        expect((emitResults[5] as any).value).toBeInstanceOf(QueueOverflowError)
                        expect((emitResults[6] as any).value).toBeInstanceOf(QueueOverflowError)
                        expect((emitResults[7] as any).value).toBeInstanceOf(QueueOverflowError)
                        expect(results).toEqual([1, 2, 3, 4, 5])
                        resolve()
                    } catch (err) {
                        reject(err)
                    }
                })
            })
        })

    })

    describe("Queue with lifetime", () => {

        test("超时的消息应该被丢弃并触发onDrop回调", () => {
            const results: number[] = []
            const droppedMessages: number[] = []
            let first: boolean = true

            emitter.on("test", async (msg) => {
                await delay(1000)
                first = false
                results.push(msg.payload)
            }, {
                pipes: [queue({
                    size: 5,
                    lifetime: 500, // 设置消息生命周期为500ms
                    onDrop: (msg) => droppedMessages.push(msg.payload)
                })]
            })

            const promises = [
                ...emitter.emit("test", 1),  // 马上处理
                ...emitter.emit("test", 2),  // 进入队列
                ...emitter.emit("test", 3),  // 进入队列
                ...emitter.emit("test", 4),  // 进入队列
                ...emitter.emit("test", 5),  // 进入队列
            ]

            return new Promise<void>(resolve => {
                // 推进时间600ms，使队列中的消息超时
                vi.advanceTimersByTime(600)
                promises.push(...[
                    ...emitter.emit("test", 6),  // 马上处理
                    ...emitter.emit("test", 7),  // 进入队列
                    ...emitter.emit("test", 8),  // 进入队列
                    ...emitter.emit("test", 9),  // 进入队列
                    ...emitter.emit("test", 10),  // 进入队列
                ])
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1, 6])  // 只有第一个消息被处理
                    expect(droppedMessages).toEqual([2, 3, 4, 5, 7, 8, 9, 10])  // 其他消息因超时被丢弃
                }).finally(() => {
                    resolve()
                })
            })
        })
    })

})