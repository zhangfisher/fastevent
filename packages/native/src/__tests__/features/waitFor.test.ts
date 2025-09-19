import { describe, test, expect } from 'vitest';
import { FastEvent } from '../../event';

describe('waitfor', () => {
    test('应该能使用单层通配符等待事件', () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();

            // 使用单层通配符等待任何user/xxx事件
            const waitPromise = emitter.waitFor('user/*');

            // 触发一个匹配的事件
            emitter.emit('user/login', { userId: 123 });

            waitPromise.then((result) => {
                expect(result).toEqual({
                    type: 'user/login',
                    payload: { userId: 123 },
                    meta: undefined,
                });
                resolve();
            });
        });
    });

    test('应该能使用多层通配符等待事件', () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();

            // 使用多层通配符等待任何user/下的事件
            const waitPromise = emitter.waitFor('user/**');

            // 触发一个深层事件
            emitter.emit('user/profile/update', { name: 'John' });

            waitPromise.then((result) => {
                expect(result).toEqual({
                    type: 'user/profile/update',
                    payload: { name: 'John' },
                    meta: undefined,
                });
                resolve();
            });
        });
    });

    test('使用通配符的事件等待应该正确处理超时', async () => {
        const emitter = new FastEvent();

        // 创建三个带超时的等待Promise，通配符只能在末尾
        const promises = [
            emitter.waitFor('user/*', 200), // 单层通配符
            emitter.waitFor('user/profile/**', 400), // 多层通配符
            emitter.waitFor('admin/*', 600), // 单层通配符
        ];

        // 延迟触发事件
        setTimeout(() => {
            emitter.emit('user/login', { id: 1 });
        }, 100);

        setTimeout(() => {
            emitter.emit('user/profile/settings/update', { theme: 'dark' });
        }, 300);

        // 第三个事件不触发，让它超时

        const results = await Promise.allSettled(promises);

        // 验证第一个Promise成功完成
        expect(results[0].status).toBe('fulfilled');
        if (results[0].status === 'fulfilled') {
            expect(results[0].value).toEqual({
                type: 'user/login',
                payload: { id: 1 },
                meta: undefined,
            });
        }

        // 验证第二个Promise成功完成
        expect(results[1].status).toBe('fulfilled');
        if (results[1].status === 'fulfilled') {
            expect(results[1].value).toEqual({
                type: 'user/profile/settings/update',
                payload: { theme: 'dark' },
                meta: undefined,
            });
        }

        // 验证第三个Promise因超时而拒绝
        expect(results[2].status).toBe('rejected');
        if (results[2].status === 'rejected') {
            expect(results[2].reason).toBeInstanceOf(Error);
            expect(results[2].reason.message).toContain('timeout');
        }
    });

    test('should resolve promise when event is emitted immediately', () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();
            // Arrange
            const eventType = 'test-event';
            const expectedPayload = { data: 'test data' };

            // Act
            // Create a promise for waitFor and store it
            const waitPromise = emitter.waitFor(eventType);

            // Emit the event immediately after calling waitFor
            emitter.emit(eventType, expectedPayload);

            // Assert
            // Wait for the promise to resolve and check the result
            waitPromise.then((result) => {
                expect(result).toEqual({
                    type: eventType,
                    payload: expectedPayload,
                    meta: undefined,
                });
                resolve();
            });
        });
    });
    test('should handle multiple events waiting simultaneously', async () => {
        return new Promise<void>((resolve) => {
            const emitter = new FastEvent();
            // Arrange
            const event1Promise = emitter.waitFor('event1');
            const event2Promise = emitter.waitFor('event2');
            const event3Promise = emitter.waitFor('event3');

            // Act
            setTimeout(() => {
                emitter.emit('event1', 'payload1');
            }, 100);

            setTimeout(() => {
                emitter.emit('event2', 'payload2');
            }, 200);

            setTimeout(() => {
                emitter.emit('event3', 'payload3');
            }, 300);

            // Assert
            Promise.all([event1Promise, event2Promise, event3Promise]).then((results) => {
                expect(results).toEqual([
                    { type: 'event1', payload: 'payload1', meta: undefined },
                    { type: 'event2', payload: 'payload2', meta: undefined },
                    { type: 'event3', payload: 'payload3', meta: undefined },
                ]);
                resolve();
            });
        });
    });

    test('should handle multiple events with different timeouts', async () => {
        const emitter = new FastEvent();
        // Arrange
        const event1Promise = emitter.waitFor('event1', 500);
        const event2Promise = emitter.waitFor('event2', 200);
        const event3Promise = emitter.waitFor('event3', 1000);

        // Act
        setTimeout(() => {
            emitter.emit('event1', 'payload1');
        }, 100);

        setTimeout(() => {
            emitter.emit('event2', 'payload2');
        }, 300);

        // Event2 will timeout before emission
        setTimeout(() => {
            emitter.emit('event3', 'payload3');
        }, 300);

        // Assert
        const results = await Promise.allSettled([event1Promise, event2Promise, event3Promise]);

        expect(results[0].status).toBe('fulfilled');
        expect((results[0] as any).value).toEqual({ type: 'event1', payload: 'payload1', meta: undefined });

        expect(results[1].status).toBe('rejected');
        //@ts-ignore
        expect(results[1].reason).toBeInstanceOf(Error);

        expect(results[2].status).toBe('fulfilled');
        expect((results[2] as any).value).toEqual({ type: 'event3', payload: 'payload3', meta: undefined });
    });

    test('等待retain事件时马上返回', async () => {
        const emitter = new FastEvent();

        emitter.emit('x', 1, true);

        // Arrange
        const results = await emitter.waitFor('x', 500);

        expect(results).toEqual({
            type: 'x',
            payload: 1,
            meta: undefined,
        });
    });
});
