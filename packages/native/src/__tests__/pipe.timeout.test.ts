import { describe, expect, vi, beforeEach, afterEach, test } from "vitest"
import { FastEvent } from "../event"
import { timeout } from "../pipe/timeout"
import { TimeoutError } from "../consts"

describe("监听器Pipe操作: Timeout", () => {
    let emitter: FastEvent

    beforeEach(() => {
        emitter = new FastEvent()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    // 使用Promise包装setTimeout，配合vi.advanceTimersByTime使用
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    describe("Timeout without default value", () => {
        test("监听器在超时时间内完成时应该正常执行", () => {
            const results: number[] = []
            emitter.on("test", async (msg) => {
                await delay(50)  // 处理时间50ms
                results.push(msg.payload)
            }, {
                pipes: [timeout(100)]  // 超时时间100ms
            })

            const promises = emitter.emit("test", 1)

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(() => {
                    expect(results).toEqual([1])
                }).finally(() => {
                    resolve()
                })
            })
        })

        test("监听器执行超时时应该抛出错误", () => {
            const results: number[] = []
            emitter.on("test", async (msg) => {
                await delay(200)  // 处理时间200ms
                results.push(msg.payload)
            }, {
                pipes: [timeout(100)]  // 超时时间100ms
            })

            const promises = emitter.emit("test", 1)

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.allSettled(promises).then(emitResults => {
                    expect((emitResults[0] as any).value).toBeInstanceOf(TimeoutError)
                    expect(results).toEqual([])
                }).finally(() => {
                    resolve()
                })
            })
        })
    })

    describe("Timeout with default value", () => {
        test("监听器执行超时时应该返回默认值", () => {
            emitter.on("test", async (msg) => {
                await delay(200)  // 处理时间200ms
                return msg.payload * 2
            }, {
                pipes: [timeout(100, 'default')]  // 超时时间100ms，默认值'default'
            })

            const promises = emitter.emit("test", 1)

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(emitResults => {
                    expect(emitResults[0]).toBe('default')
                }).finally(() => {
                    resolve()
                })
            })
        })

        test("多个事件触发时应该正确处理超时", () => {
            emitter.on("test", async (msg) => {
                await delay(msg.payload) // 处理时间根据payload决定
                return msg.payload * 2
            }, {
                pipes: [timeout(150, 'timeout')]  // 超时时间150ms，默认值'timeout'
            })

            const promises = [
                ...emitter.emit("test", 100),  // 会在150ms内完成
                ...emitter.emit("test", 200),  // 会超时
                ...emitter.emit("test", 50)    // 会在150ms内完成
            ]

            return new Promise<void>(resolve => {
                vi.runAllTimersAsync()
                Promise.all(promises).then(emitResults => {
                    expect(emitResults[0]).toBe(200)
                    expect(emitResults[1]).toBe('timeout')
                    expect(emitResults[2]).toBe(100)
                }).finally(() => {
                    resolve()
                })
            })
        })
    })
})