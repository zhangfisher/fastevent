import { describe, test, expect, vi } from "vitest"
import { FastEvent } from "../../event"
import { series } from '../../executors/series'
import { FastEventMessage } from "../../types"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

describe("Series执行器测试", () => {
    test("依次执行所有同步监听器返回最后一个监听器的结果", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map((_, i) => {
            return (message: FastEventMessage) => {
                messages.push(message)
                return ++i
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = emitter.emit<number>("test", 1, { executor: series() })
        const r = await Promise.all(results)
        expect(r.length).toBe(1)
        expect(r[0]).toBe(10)
    })
    test("逆序执行所有同步监听器返回最后一个监听器的结果", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map((_, i) => {
            return (message: FastEventMessage) => {
                messages.push(message)
                return ++i
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = emitter.emit<number>("test", 1, {
            executor: series({
                reverse: true
            })
        })
        const r = await Promise.all(results)
        expect(r.length).toBe(1)
        expect(r[0]).toBe(1)
    })
    test("依次执行所有监听器返回最后一个监听器的结果", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, { executor: series() })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(10)
    })
    test("依次执行同步和异步混合监听器返回最后一个监听器的结果", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return (message: FastEventMessage) => {
                messages.push(message)
                if (messages.length % 2 === 0) {
                    return new Promise<number>(resolve => {
                        resolve(messages.length)
                    })
                } else {
                    return messages.length
                }
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, { executor: series() })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(10)
    })

    test("串行执行监听器对结果进行reduce操作", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: series({
                onReturns: (results: number, result: number) => {
                    if (results === undefined) results = 0
                    return results + result
                }
            })
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(55)
    })
    test("串行执行监听器时出错时: 默认跳过继续执行后续监听器", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                if (messages.length === 5) {
                    throw new Error("test")
                }
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: series()
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(10)
    })

    test("串行执行监听器时出错时: skip跳过继续执行后续监听器", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                if (messages.length === 5) {
                    throw new Error("test")
                }
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: series({
                onError: () => 'skip'
            })
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(10)
    })
    test("串行执行监听器时出错时: abort中止执行后续监听器", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                if (messages.length === 5) {
                    throw new Error("test")
                }
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: series({
                onError: 'abort'
            })
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(4)
    })
    test("串行执行监听器时onNext控制是否继续执行", async () => {
        const emitter = new FastEvent()
        const messages: FastEventMessage[] = []
        const listeners = Array.from({ length: 10 }).map(() => {
            return async (message: FastEventMessage) => {
                messages.push(message)
                return messages.length
            }
        })
        listeners.forEach(listener => {
            emitter.on("test", listener)
        })
        const results = await emitter.emitAsync<number>("test", 1, {
            executor: series({
                onNext: (index: number) => {
                    return index <= 5
                }
            })
        })
        expect(results.length).toBe(1)
        expect(results[0]).toBe(5)
    })
})