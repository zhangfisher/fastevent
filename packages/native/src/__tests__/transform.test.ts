import { describe, test, expect } from 'vitest';
import { FastEvent } from '../event';
import { AssertFastMessage } from '../types';

describe('转换事件消息', async () => {
    test('转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type CustomEvents = {
                click: AssertFastMessage<{ x: number; y: number }>;
                mousemove: AssertFastMessage<boolean>;
                scroll: number;
                focus: string;
            };
            const emitter = new FastEvent<CustomEvents>({
                transform: (message) => {
                    return message.payload;
                },
            });

            emitter.emit('scroll', 1);
            emitter.emit('xxxx', 1);

            emitter.on('click', (message) => {
                expect(message.x).toBe(100);
                expect(message.y).toBe(100);
            });
            emitter.emit('click', { x: 100, y: 100 });
            emitter.emit('scroll', 1);
            emitter.on('mousemove', (message) => {
                expect(message).toBe(true);
                resolve();
            });
            emitter.emit({
                type: 'mousemove',
                payload: true,
            });
        });
    });
    test('异步侦听转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type CustomEvents = {
                click: AssertFastMessage<{ x: number; y: number }>;
                mousemove: AssertFastMessage<boolean>;
                scroll: number;
                focus: string;
            };
            const emitter = new FastEvent<CustomEvents>({
                transform: (message) => {
                    return message.payload;
                },
            });

            emitter.on('click', (message) => {
                expect(message.x).toBe(100);
                expect(message.y).toBe(100);
            });
            emitter.emitAsync('click', { x: 100, y: 100 });

            emitter.on('mousemove', (message) => {
                expect(message).toBe(true);
                resolve();
            });
            emitter.emit({
                type: 'mousemove',
                payload: true,
            });
        });
    });
    test('Scope:转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type CustomEvents = {
                'div/click': AssertFastMessage<{ x: number; y: number }>;
                'div/mousemove': AssertFastMessage<boolean>;
                'div/scroll': number;
                'div/focus': string;
            };
            const emitter = new FastEvent<CustomEvents>({
                transform: (message) => {
                    return message.payload;
                },
            });

            const scope = emitter.scope('div');

            scope.on('click', (message) => {
                expect(message.x).toBe(100);
                expect(message.y).toBe(100);
            });
            scope.emit('click', { x: 100, y: 100 });
            scope.emit('scroll', 1);

            scope.on('mousemove', (message) => {
                expect(message).toBe(true);
                resolve();
            });
            scope.emit({
                type: 'mousemove',
                payload: true,
            });
        });
    });
    test('Scope:异步侦听转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type CustomEvents = {
                'div/click': AssertFastMessage<{ x: number; y: number }>;
                'div/mousemove': AssertFastMessage<boolean>;
                'div/scroll': number;
                'div/focus': string;
            };
            const emitter = new FastEvent<CustomEvents>({
                transform: (message) => {
                    return message.payload;
                },
            });

            const scope = emitter.scope('div');

            scope.on('click', (message) => {
                expect(message.x).toBe(100);
                expect(message.y).toBe(100);
            });
            scope.emitAsync('click', { x: 100, y: 100 });

            scope.on('mousemove', (message) => {
                // message=1
                expect(message).toBe(true);
                resolve();
            });
            scope.emitAsync({
                type: 'mousemove',
                payload: true,
            });

            scope.on('scroll', (message) => {
                message.payload;
            });
        });
    });
});
