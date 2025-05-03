import { describe, expect, vi, beforeEach, afterEach, test } from "vitest"
import { FastEvent } from "../event"
import { debounce } from "../pipe/debounce"
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("监听器Pipe操作: Debounce", () => {
    let emitter: FastEvent

    beforeEach(() => {
        emitter = new FastEvent()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('第一次调用应该立即执行', async () => {
        const results: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [debounce(100)]
        })

        await emitter.emit("test", 1)
        expect(results).toEqual([1])
    })

    test('在防抖动时间内的多次调用应该被丢弃', async () => {
        const results: number[] = []
        const dropped: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [debounce(100, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        // 第一次调用
        await emitter.emit("test", 1)
        expect(results).toEqual([1])

        // 在100ms内快速发送12个事件
        const promises = []
        for (let i = 2; i <= 13; i++) {
            vi.advanceTimersByTime(8) // 每8ms发送一个事件
            promises.push(...emitter.emit("test", i))
        }
        await Promise.all(promises)
        expect(results).toEqual([1])
        expect(dropped).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])

        // 等待防抖动时间过后的调用
        await vi.runAllTimersAsync()
        await emitter.emit("test", 14)
        expect(results).toEqual([1, 14])
    })

    test('应该正确调用drop回调函数', () => {
        const results: number[] = []
        const dropped: number[] = []

        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [debounce(100, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        return new Promise<void>(resolve => {
            // 第一次调用
            Promise.all(emitter.emit("test", 1)).then(() => {
                // 在防抖动时间内的调用应该触发drop回调
                Promise.all([
                    ...emitter.emit("test", 2),
                    ...emitter.emit("test", 3),
                    ...emitter.emit("test", 4)
                ]).then(() => {
                    expect(results).toEqual([1])
                    expect(dropped).toEqual([2, 3, 4])

                    // 等待防抖动时间过后
                    vi.runAllTimersAsync().then(() => {
                        Promise.all(emitter.emit("test", 5)).then(() => {
                            expect(results).toEqual([1, 5])
                            resolve()
                        })
                    })
                })
            })
        })
    })

    test('复杂场景测试', () => {
        const results: number[] = []
        const dropped: number[] = []

        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [debounce(100, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        return new Promise<void>(resolve => {
            // 第一组：正常执行
            Promise.all(emitter.emit("test", 1)).then(() => {
                expect(results).toEqual([1])

                // 第二组：在防抖动时间内快速发送12个事件
                const promises1 = []
                for (let i = 2; i <= 13; i++) {
                    vi.advanceTimersByTime(8)
                    promises1.push(...emitter.emit("test", i))
                }

                Promise.all(promises1).then(() => {
                    expect(results).toEqual([1])
                    expect(dropped).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13])

                    // 等待防抖动时间过后
                    vi.runAllTimersAsync().then(() => {
                        // 第三组：新的调用可以执行
                        Promise.all(emitter.emit("test", 14)).then(() => {
                            expect(results).toEqual([1, 14])

                            // 第四组：在防抖动时间内快速发送15个事件
                            const promises2 = []
                            for (let i = 15; i <= 29; i++) {
                                vi.advanceTimersByTime(6)
                                promises2.push(...emitter.emit("test", i))
                            }

                            Promise.all(promises2).then(() => {
                                expect(results).toEqual([1, 14])
                                expect(dropped).toEqual([
                                    2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
                                    15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29
                                ])

                                // 等待防抖动时间过后
                                vi.runAllTimersAsync().then(() => {
                                    // 第五组：新的调用可以执行
                                    Promise.all(emitter.emit("test", 30)).then(() => {
                                        expect(results).toEqual([1, 14, 30])
                                        resolve()
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })

    test('高频消息的防抖动行为', async () => {
        const results: number[] = []
        const dropped: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [debounce(10, {  // 10ms防抖动时间
                drop: (msg) => dropped.push(msg.payload)
            })]
        })


        // 每2ms发送一条消息，总共发送100条
        const promises: any[] = []
        const emitMessages = async () => {
            for (let i = 1; i <= 100; i++) {
                await delay(2)
                emitter.emit("test", i)
            }
        }
        emitMessages()
        return new Promise<void>((resolve) => {
            vi.runAllTimersAsync().then(async () => {
                await Promise.all(promises)
                // 1. 接收到从1开始，间隔5的数列
                expect(results).toEqual([1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96])
                // 2. 其他消息均会被丢弃
                expect(Array.from({ length: 100 }).map((_, i) => i + 1).filter((i) => {
                    return !results.includes(i)
                })).toEqual(dropped)

                resolve()
            })
        })

    })

    test('异步监听器的防抖动行为', () => {
        const results: number[] = []
        const dropped: number[] = []

        // 创建一个异步监听器，处理时间为50ms
        emitter.on("test", async (msg) => {
            await vi.advanceTimersByTimeAsync(50) // 模拟异步操作
            results.push(msg.payload)
        }, {
            pipes: [debounce(100, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        return new Promise<void>(resolve => {
            // 第一次调用
            Promise.all(emitter.emit("test", 1)).then(() => {
                expect(results).toEqual([1])

                // 在异步操作进行时发送事件（25ms时）
                vi.advanceTimersByTime(25)
                const promises1 = []
                for (let i = 2; i <= 6; i++) {
                    promises1.push(...emitter.emit("test", i))
                }

                Promise.all(promises1).then(() => {
                    expect(dropped).toEqual([2, 3, 4, 5, 6])

                    // 等待第一个异步操作完成后的剩余防抖动时间
                    vi.runAllTimersAsync().then(() => {
                        // 防抖动时间结束后的新调用
                        Promise.all(emitter.emit("test", 7)).then(() => {
                            expect(results).toEqual([1, 7])

                            // 在第二个异步操作进行时发送更多事件
                            vi.advanceTimersByTime(25)
                            const promises2 = []
                            for (let i = 8; i <= 12; i++) {
                                promises2.push(...emitter.emit("test", i))
                            }

                            Promise.all(promises2).then(() => {
                                expect(dropped).toEqual([2, 3, 4, 5, 6, 8, 9, 10, 11, 12])

                                // 等待所有操作完成
                                vi.runAllTimersAsync().then(() => {
                                    expect(results).toEqual([1, 7])

                                    // 验证最后一次调用可以正常执行
                                    Promise.all(emitter.emit("test", 13)).then(() => {
                                        expect(results).toEqual([1, 7, 13])
                                        resolve()
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})