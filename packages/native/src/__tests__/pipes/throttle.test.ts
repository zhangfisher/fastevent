import { describe, expect, vi, beforeEach, afterEach, test } from "vitest"
import { FastEvent } from "../../event"
import { throttle } from "../../pipes/throttle"
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("监听器Pipe操作: Throttle", () => {
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
            pipes: [throttle(10)]
        })

        await emitter.emit("test", 1)
        expect(results).toEqual([1])
    })

    test('在节流时间间隔内的调用应该被丢弃', async () => {
        const results: number[] = []
        const dropped: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [throttle(10, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        // 第一次调用
        await emitter.emit("test", 1)
        expect(results).toEqual([1])

        // 5ms后的调用应该被丢弃
        vi.advanceTimersByTime(5)
        await emitter.emit("test", 2)
        expect(results).toEqual([1])
        expect(dropped).toEqual([2])

        // 10ms后的调用应该执行
        vi.advanceTimersByTime(5)
        await emitter.emit("test", 3)
        expect(results).toEqual([1, 3])
    })

    test('高频消息应该正确节流', async () => {
        const results: number[] = []
        const dropped: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [throttle(10, {  // 10ms防抖动时间
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

    test('应该正确调用drop回调函数', async () => {
        const results: number[] = []
        const dropped: number[] = []
        emitter.on("test", (msg) => {
            results.push(msg.payload)
        }, {
            pipes: [throttle(10, {
                drop: (msg) => dropped.push(msg.payload)
            })]
        })

        // 第一次调用
        await emitter.emit("test", 1)
        expect(results).toEqual([1])

        // 5ms后的调用应该触发drop回调
        vi.advanceTimersByTime(5)
        await emitter.emit("test", 2)
        expect(dropped).toEqual([2])

        // 10ms后的调用应该执行
        vi.advanceTimersByTime(5)
        await emitter.emit("test", 3)
        expect(results).toEqual([1, 3])
    })
})