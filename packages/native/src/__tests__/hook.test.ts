import { describe, test, expect, vi } from 'vitest'
import { FastEvent } from '../event'
import { AbortError } from '../consts'

describe('FastEvent钩子函数测试', () => {
    test('当添加新的监听器时应该触发onAddListener', () => {
        const onAddListener = vi.fn()
        const emitter = new FastEvent({
            onAddListener
        })

        const listener = () => { }
        emitter.on('test', listener)

        expect(onAddListener).toHaveBeenCalledTimes(1)
        expect(onAddListener).toHaveBeenCalledWith(['test'], listener)
    })

    test('当移除监听器时应该触发onRemoveListener', () => {
        const onRemoveListener = vi.fn()
        const emitter = new FastEvent({
            onRemoveListener
        })

        const listener = () => { }
        const subscriber = emitter.on('test', listener)
        subscriber.off()

        expect(onRemoveListener).toHaveBeenCalledTimes(1)
        expect(onRemoveListener).toHaveBeenCalledWith(['test'], listener)
    })

    test('当清空所有监听器时应该触发onClearListeners', () => {
        const onClearListeners = vi.fn()
        const emitter = new FastEvent({
            onClearListeners
        })

        emitter.on('test1', () => { })
        emitter.on('test2', () => { })
        emitter.offAll()

        expect(onClearListeners).toHaveBeenCalledTimes(1)
    })

    test('当监听器执行出错时应该触发onListenerError', () => {
        const onListenerError = vi.fn()
        const emitter = new FastEvent({
            onListenerError
        })

        const error = new Error('测试错误')
        const listener = () => {
            throw error
        }

        emitter.on('test', listener)
        emitter.emit('test')

        expect(onListenerError).toHaveBeenCalledTimes(1)
        expect(onListenerError).toHaveBeenCalledWith(listener, error, {
            "meta": undefined,
            "payload": undefined,
            "type": "test",
        }, {
            executor: undefined
        })
    })

    test('执行监听器后应该触发onAfterExecuteListener', () => {
        const onAfterExecuteListener = vi.fn()
        const emitter = new FastEvent({
            onAfterExecuteListener
        })

        const listener = () => 'result'
        emitter.on('test', listener)
        emitter.emit('test', 'payload')

        expect(onAfterExecuteListener).toHaveBeenCalledTimes(1)
        expect(onAfterExecuteListener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'test',
                payload: 'payload',
                meta: undefined
            }),
            ['result'],
            [{ __listeners: [[listener, 0, 1]] }]
        )
    })

    test('当onBeforeExecuteListener返回false时应该中止事件执行', () => {
        const onBeforeExecuteListener = vi.fn().mockReturnValue(false)
        const onAfterExecuteListener = vi.fn()
        const listener = vi.fn()

        const emitter = new FastEvent({
            onBeforeExecuteListener,
            onAfterExecuteListener
        })

        emitter.on('test', listener)

        expect(() => emitter.emit('test', 'payload')).toThrow(AbortError)
        expect(onBeforeExecuteListener).toHaveBeenCalledTimes(1)
        expect(onBeforeExecuteListener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'test',
                payload: 'payload',
                meta: undefined
            }),
            expect.any(Object)
        )
        expect(listener).not.toHaveBeenCalled()
        expect(onAfterExecuteListener).not.toHaveBeenCalled()
    })

    test('多层级事件路径应该正确传递给onAddListener和onRemoveListener', () => {
        const onAddListener = vi.fn()
        const onRemoveListener = vi.fn()
        const emitter = new FastEvent({
            onAddListener,
            onRemoveListener
        })

        const listener = () => { }
        const subscriber = emitter.on('a/b/c', listener)
        subscriber.off()

        expect(onAddListener).toHaveBeenCalledWith(['a', 'b', 'c'], listener)
        expect(onRemoveListener).toHaveBeenCalledWith(['a', 'b', 'c'], listener)
    })

    test('使用通配符的事件路径应该正确传递给钩子函数', () => {
        const onAddListener = vi.fn()
        const emitter = new FastEvent({
            onAddListener
        })

        const listener = () => { }
        emitter.on('a/*/c', listener)

        expect(onAddListener).toHaveBeenCalledWith(['a', '*', 'c'], listener)
    })

    test('当监听器抛出错误且ignoreErrors为false时应该抛出错误', () => {
        const onListenerError = vi.fn()
        const emitter = new FastEvent({
            ignoreErrors: false,
            onListenerError
        })

        const error = new Error('测试错误')
        const listener = () => {
            throw error
        }
        emitter.on('test', listener)

        expect(() => emitter.emit('test')).toThrow(error)
        expect(onListenerError).toHaveBeenCalledWith(listener, error, {
            "meta": undefined,
            "payload": undefined,
            "type": "test",
        }, {
            executor: undefined
        })
    })
})