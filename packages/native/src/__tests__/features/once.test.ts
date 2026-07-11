import { describe, test, expect, vi } from 'vitest';
import { FastEvent } from '../../event';

describe('只订阅一次的事件的发布与订阅', async () => {
    test('简单发布只订阅一次事件', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        emitter.once('x', ({ payload, type }) => {
            expect(type).toBe('x');
            expect(payload).toBe(1);
            events.push(type);
        });
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        expect(events).toEqual(['x']);
    });
    test('简单发布只订阅一次事件后取消', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        const subscriber = emitter.once('x', ({ payload, type }) => {
            expect(type).toBe('x');
            expect(payload).toBe(1);
            events.push(type);
        });
        subscriber.off();
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        expect(events).toEqual([]);
    });
    test('简单发布只订阅一次的多级事件', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        emitter.once('a.b.c.d', ({ payload, type }) => {
            expect(type).toBe('a.b.c.d');
            expect(payload).toBe(1);
            events.push(type);
        });
        emitter.emit('a.b.c.d', 1);
        emitter.emit('a.b.c.d', 2);
        emitter.emit('a.b.c.d', 3);
        emitter.emit('a.b.c.d', 4);
        expect(events).toEqual(['a.b.c.d']);
    });
    test('混合发布只订阅一次的多级事件', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        const values: number[] = [];
        emitter.once('a.b.c.d', ({ payload, type }) => {
            expect(type).toBe('a.b.c.d');
            values.push(payload);
            events.push(type);
        });
        emitter.on('a.b.c.d', ({ payload, type }) => {
            expect(type).toBe('a.b.c.d');
            values.push(payload);
            events.push(type);
        });
        emitter.emit('a.b.c.d', 1);
        emitter.emit('a.b.c.d', 2);
        emitter.emit('a.b.c.d', 3);
        emitter.emit('a.b.c.d', 4);
        expect(events).toEqual(['a.b.c.d', 'a.b.c.d', 'a.b.c.d', 'a.b.c.d', 'a.b.c.d']);
        expect(values).toEqual([1, 1, 2, 3, 4]);
    });

    test('多个只订阅一次事件监听器均应该正确销毁', () => {
        const emitter = new FastEvent();
        const events: number[] = [];

        emitter.once('x', () => {
            events.push(1);
        });
        emitter.once('x', () => {
            events.push(2);
        });
        emitter.once('x', () => {
            events.push(3);
        });
        emitter.once('x', () => {
            events.push(4);
        });
        emitter.once('x', () => {
            events.push(5);
        });

        emitter.emit('x', 1);
        expect(events).toEqual([1, 2, 3, 4, 5]);

        const listeners = emitter.getListeners('x');
        expect(listeners.length).toBe(0);
    });
    test('在once侦听器里面再次触发时，侦听器只执行一次', () => {
        const emitter = new FastEvent();
        const values: number[] = [];
        return new Promise<void>((resolve) => {
            emitter.once(`x`, (event) => {
                values.push(event.payload);
                emitter.emit('x', 1);
                emitter.emit('x', 2);
                emitter.emit('x', 3);
                emitter.emit('x', 4);
                resolve();
                expect(values.length).toBe(1);
            });
            emitter.emit('x', 0);
        });
    });
});

// 回归：once/count 监听器在跨多节点匹配时被错误删除/漏删
// 根因：_decListenerExecCount 的 splice 误用外层收集列表下标，应使用 listener
// 在所属 __listeners 内的本地下标 listeners[i][1]。
describe('once 跨多节点匹配回归', () => {
    test('once + onAny(**) 共存时 emit 后 once 监听器被正确移除', () => {
        const emitter = new FastEvent();
        const m0 = vi.fn(); // onAny -> root["**"].__listeners[0]
        const l0 = vi.fn(); // on('a') -> root["a"].__listeners[0]
        const l1 = vi.fn(); // once('a') -> root["a"].__listeners[1]
        const l2 = vi.fn(); // once('a') -> root["a"].__listeners[2]
        emitter.onAny(m0);
        emitter.on('a', l0);
        emitter.once('a', l1);
        emitter.once('a', l2);

        emitter.emit('a', 1);
        expect(m0).toHaveBeenCalledTimes(1);
        expect(l0).toHaveBeenCalledTimes(1);
        expect(l1).toHaveBeenCalledTimes(1);
        expect(l2).toHaveBeenCalledTimes(1);

        // 第二次 emit：once 监听器不应再触发（bug 时 l1 泄漏会再次执行）
        emitter.emit('a', 2);
        expect(m0).toHaveBeenCalledTimes(2);
        expect(l0).toHaveBeenCalledTimes(2);
        expect(l1).toHaveBeenCalledTimes(1);
        expect(l2).toHaveBeenCalledTimes(1);
    });

    test('once + on(*) 跨多节点时 once 被正确移除', () => {
        const emitter = new FastEvent();
        const w = vi.fn(); // on('*') -> root["*"].__listeners[0]
        const l0 = vi.fn(); // on('a') -> root["a"].__listeners[0]
        const l1 = vi.fn(); // once('a') -> root["a"].__listeners[1]
        emitter.on('*', w);
        emitter.on('a', l0);
        emitter.once('a', l1);

        emitter.emit('a', 1);
        expect(w).toHaveBeenCalledTimes(1);
        expect(l0).toHaveBeenCalledTimes(1);
        expect(l1).toHaveBeenCalledTimes(1);

        emitter.emit('a', 2);
        expect(w).toHaveBeenCalledTimes(2);
        expect(l0).toHaveBeenCalledTimes(2);
        expect(l1).toHaveBeenCalledTimes(1);
    });

    test('once 监听器执行后 listenerCount 应递减', () => {
        const emitter = new FastEvent();
        emitter.once('a', vi.fn());
        emitter.once('a', vi.fn());
        expect(emitter.listenerCount).toBe(2);
        emitter.emit('a', 1);
        expect(emitter.listenerCount).toBe(0); // bug 时为 2
    });
});
