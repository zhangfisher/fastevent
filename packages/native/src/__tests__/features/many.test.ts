import { describe, test, expect } from 'vitest';
import { FastEvent } from '../../event';

describe('指定次数事件的发布与订阅', async () => {
    test('简单发布只订阅2次事件', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        emitter.on(
            'x',
            ({ payload, type }) => {
                expect(type).toBe('x');
                expect(payload).toBe(1);
                events.push(type);
            },
            { count: 2 },
        );
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        emitter.emit('x', 1);
        expect(events).toEqual(['x', 'x']);
    });
});
