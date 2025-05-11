import { describe, test, expect, vi, beforeEach } from 'vitest'
import { FastEvent } from '../../event'
import { memorize } from '../../pipes/memorize'

describe('memorize pipe', () => {
    let emitter: FastEvent

    beforeEach(() => {
        emitter = new FastEvent()
    })

    test("首次调用应该执行处理函数", async () => {
        let counter = 0
        const mockFn = vi.fn().mockImplementation(() => ++counter)

        emitter.on('test', mockFn, {
            pipes: [memorize()]
        })

        const [promise] = emitter.emit('test', 'data')
        const result = await promise

        expect(result).toBe(1)
        expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test("相同payload的重复调用应该使用缓存", async () => {
        let counter = 0
        const mockFn = vi.fn().mockImplementation(() => ++counter)

        emitter.on('test', mockFn, {
            pipes: [memorize()]
        })

        // 第一次调用
        const [promise1] = emitter.emit('test', 'data')
        const result1 = await promise1

        // 第二次调用相同的payload
        const [promise2] = emitter.emit('test', 'data')
        const result2 = await promise2

        expect(result1).toBe(1)
        expect(result2).toBe(1) // 应该使用缓存
        expect(mockFn).toHaveBeenCalledTimes(1)
    })

    test("不同payload的调用应该重新执行处理函数", async () => {
        let counter = 0
        const mockFn = vi.fn().mockImplementation(() => ++counter)

        emitter.on('test', mockFn, {
            pipes: [memorize()]
        })

        // 第一次调用
        const [promise1] = emitter.emit('test', 'data1')
        const result1 = await promise1

        // 第二次调用不同的payload
        const [promise2] = emitter.emit('test', 'data2')
        const result2 = await promise2

        expect(result1).toBe(1)
        expect(result2).toBe(2)
        expect(mockFn).toHaveBeenCalledTimes(2)
    })

    test("使用自定义判断函数决定是否使用缓存", async () => {
        let counter = 0
        const mockFn = vi.fn().mockImplementation(() => ++counter)
        const predicate = vi.fn().mockImplementation((message) => message.payload === 'use-cache')

        emitter.on('test', mockFn, {
            pipes: [memorize(predicate)]
        })

        // 第一次调用
        const [promise1] = emitter.emit('test', 'use-cache')
        const result1 = await promise1

        // 第二次调用，predicate返回true，应该使用缓存
        const [promise2] = emitter.emit('test', 'use-cache')
        const result2 = await promise2

        // 第三次调用，predicate返回false，不应该使用缓存
        const [promise3] = emitter.emit('test', 'no-cache')
        const result3 = await promise3

        expect(result1).toBe(1)
        expect(result2).toBe(1) // 使用缓存
        expect(result3).toBe(2) // 重新执行
        expect(mockFn).toHaveBeenCalledTimes(2)
        expect(predicate).toHaveBeenCalledTimes(2)
    })

    test("缓存应该在每个监听器之间独立", async () => {
        let counter1 = 0
        const mockFn1 = vi.fn().mockImplementation(() => ++counter1)

        let counter2 = 0
        const mockFn2 = vi.fn().mockImplementation(() => ++counter2)

        emitter.on('test1', mockFn1, {
            pipes: [memorize()]
        })

        emitter.on('test2', mockFn2, {
            pipes: [memorize()]
        })

        // 调用第一个监听器两次
        const [promise1] = emitter.emit('test1', 'data')
        const result1 = await promise1
        const [promise2] = emitter.emit('test1', 'data')
        const result2 = await promise2

        // 调用第二个监听器两次
        const [promise3] = emitter.emit('test2', 'data')
        const result3 = await promise3
        const [promise4] = emitter.emit('test2', 'data')
        const result4 = await promise4

        expect(result1).toBe(1)
        expect(result2).toBe(1) // 使用缓存
        expect(result3).toBe(1)
        expect(result4).toBe(1) // 使用缓存
        expect(mockFn1).toHaveBeenCalledTimes(1)
        expect(mockFn2).toHaveBeenCalledTimes(1)
    })
})