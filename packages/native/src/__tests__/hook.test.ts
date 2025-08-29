import { describe, test, expect, vi } from 'vitest'
import { FastEvent } from '../event'
import { AbortError, CancelError } from '../consts';

describe('FastEvent钩子函数测试', () => {
    test('当添加新的监听器时应该触发onAddListener', () => {
        const onAddListener = vi.fn()
        const emitter = new FastEvent({
            onAddListener
        })

        const listener = () => { }
        emitter.on('test', listener)

        expect(onAddListener).toHaveBeenCalledTimes(1)
        expect(onAddListener).toHaveBeenCalledWith('test', listener, {
            "count": 0,
            flags: 0,
            "prepend": false,
        })
    })

    test('当添加新的监听器时onAddListener返回false取消添加', () => {
        const onAddListener = vi.fn().mockReturnValue(false)
        const emitter = new FastEvent({
            onAddListener
        })

        const listener = () => { }
        try {
            emitter.on('test', listener)
        } catch (e: any) {
            expect(e).toBeInstanceOf(CancelError)
        }
        expect(emitter.listenerCount).toBe(0)
    })
    test('使用onAddListener将订阅转换到其他emitter', () => {


        const listener = vi.fn()

        const otherEmitter = new FastEvent()

        const emitter = new FastEvent({
            onAddListener: vi.fn().mockImplementation((type, listener, options) => {
                return otherEmitter.on(type, listener, options)
            })
        })

        emitter.on('test', listener)
        expect(emitter.listenerCount).toBe(0)
        expect(otherEmitter.listenerCount).toBe(1)

        emitter.emit('test', 1)
        otherEmitter.emit('test', 2)

        expect(listener).toHaveBeenCalledTimes(1)
        // 断言listener被调用时传入一个对象，对象中包括一个payload值=2
        expect(listener).toHaveBeenCalledWith({
            "meta": undefined,
            "payload": 2,
            "type": "test",
        }, {
            "executor": undefined,
        })

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
        expect(onRemoveListener).toHaveBeenCalledWith('test', listener)
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
        expect(onListenerError).toHaveBeenCalledWith(error, listener, {
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
            [{ __listeners: [[listener, 0, 1,undefined,0]] }]
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

        expect(onAddListener).toHaveBeenCalledWith('a/b/c', listener, {
            "count": 0,
            "flags": 0,
            "prepend": false,
        })
        expect(onRemoveListener).toHaveBeenCalledWith('a/b/c', listener)
    })

    test('使用通配符的事件路径应该正确传递给钩子函数', () => {
        const onAddListener = vi.fn()
        const emitter = new FastEvent({
            onAddListener
        })

        const listener = () => { }
        emitter.on('a/*/c', listener)

        expect(onAddListener).toHaveBeenCalledWith('a/*/c', listener, {
            "count": 0,
            "flags": 0,
            "prepend": false,
        },)
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
        expect(onListenerError).toHaveBeenCalledWith(error, listener, {
            "meta": undefined,
            "payload": undefined,
            "type": "test",
        }, {
            executor: undefined
        })
    })
})