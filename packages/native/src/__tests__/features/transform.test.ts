import { describe, test, expect } from 'vitest';
import { FastEvent } from '../../event';
import { AssertFastMessage, FastEventMessage, TransformedEvents } from '../../types';
import { FastEventScope } from '../../scope';

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
            emitter.once('mousemove', (message) => {
                message;
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

            scope.on('aaaa', (message) => {
                message.type;
            });
        });
    });
    test('在Scope中进行transform转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type CustomEvents = TransformedEvents<{
                'client/connect': number;
                'client/disconnect': number;
            }>;
            const emitter = new FastEvent();

            class MyScope extends FastEventScope<CustomEvents> {
                constructor() {
                    super(
                        Object.assign(
                            {
                                transform: (message: FastEventMessage) => {
                                    return message.payload;
                                },
                            },
                            arguments[0],
                        ),
                    );
                }
            }

            const scope = emitter.scope('div', new MyScope());

            emitter.on('div/client/connect', (message) => {
                expect(message).toBe(100);
            });

            scope.on('client/connect', (message) => {
                expect(message).toBe(100);
                resolve();
            });
            scope.emit('client/connect', 100);
        });
    });

    test('多个Scope中进行transform转换自定义侦听消息', () => {
        return new Promise<void>((resolve) => {
            type ClientScopeEvents = TransformedEvents<{
                'client/connect': number;
                'client/disconnect': number;
            }>;
            type RoomScopeEvents = TransformedEvents<{
                'room/join': { name: string };
                'room/leabe': boolean;
            }>;

            const emitter = new FastEvent();

            const clientScope = emitter.scope<ClientScopeEvents>('x');
            clientScope.options.transform = (message) => {
                return message.payload;
            };
            const roomScope = emitter.scope<RoomScopeEvents>('y');
            roomScope.options.transform = (message) => {
                return message.payload;
            };

            const results: any[] = [];
            emitter.on('x/client/connect', (message) => {
                results.push(message);
            });
            emitter.on('y/room/join', (message) => {
                results.push(message);
            });
            clientScope.on('client/connect', (message) => {
                expect(message).toBe(100);
                results.push(message);
            });
            clientScope.emit('client/connect', 100);

            roomScope.on('room/join', (message) => {
                expect(message.name).toBe('test');
                results.push(message);
                expect(results).toEqual([100, 100, { name: 'test' }, { name: 'test' }]);
                resolve();
            });
            roomScope.emit('room/join', { name: 'test' });
        });
    });
    // test('在emitter中触发Scope中进行transform转换自定义侦听消息', () => {
    //     return new Promise<void>((resolve) => {
    //         type CustomEvents = TransformedEvents<{
    //             'client/connect': number;
    //             'client/disconnect': number;
    //         }>;
    //         const emitter = new FastEvent();

    //         class MyScope extends FastEventScope<CustomEvents> {
    //             constructor() {
    //                 super(
    //                     Object.assign(
    //                         {
    //                             transform: (message: FastEventMessage) => {
    //                                 return message.payload;
    //                             },
    //                         },
    //                         arguments[0],
    //                     ),
    //                 );
    //             }
    //         }

    //         const scope = emitter.scope('div', new MyScope());

    //         emitter.on('div/client/connect', (message) => {
    //             expect(message.payload).toBe(100);
    //         });

    //         scope.on('client/connect', (message) => {
    //             expect(message).toBe(100);
    //             resolve();
    //         });
    //         emitter.emit('div/client/connect', 100);
    //     });
    // });
});
