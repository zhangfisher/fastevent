import { describe, test, expect } from 'vitest';
import { FastEvent } from '../../event';

describe('监听器元数据', async () => {
    test('获取指定事件的注册元信息', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        emitter.on('x', ({ type }) => {
            events.push(type);
        });
        emitter.on(
            'x',
            ({ type }) => {
                events.push(type);
            },
            { count: 2 },
        );

        const metas = emitter.getListeners('x');

        expect(metas[0][1]).toBe(0);
        expect(metas[0][2]).toBe(0);
        expect(metas[1][1]).toBe(2);
        expect(metas[1][2]).toBe(0);
    });

    test('触发事件时提供额外的tag', () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        emitter.on(
            'x',
            ({ type }) => {
                events.push(type);
            },
            { tag: 'a' },
        );
        emitter.on(
            'x',
            ({ type }) => {
                events.push(type);
            },
            { count: 2, tag: 'b' },
        );

        const metas = emitter.getListeners('x');

        expect(metas[0][1]).toBe(0);
        expect(metas[0][2]).toBe(0);
        expect(metas[0][3]).toBe('a');
        expect(metas[1][1]).toBe(2);
        expect(metas[1][2]).toBe(0);
        expect(metas[1][3]).toBe('b');
    });
});
