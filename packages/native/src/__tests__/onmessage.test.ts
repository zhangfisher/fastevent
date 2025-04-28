import { describe, expect, test } from 'vitest';
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import { FastEventMessage } from '../types';

describe('onMessage测试', () => {
    describe('FastEvent类', () => {
        test('on方法未指定监听器时应调用onMessage', () => {
            class CustomEvent extends FastEvent {
                onMessageCalled = false;
                onMessage(message: FastEventMessage) {
                    this.onMessageCalled = true;
                }
            }

            const emitter = new CustomEvent();
            const subscriber = emitter.on('test');

            emitter.emit('test', { data: 'test' });
            expect(emitter.onMessageCalled).toBe(true);

            subscriber.off();
        });

        test('once方法未指定监听器时应调用onMessage', () => {
            class CustomEvent extends FastEvent {
                onMessageCalled = false;
                onMessage(message: FastEventMessage) {
                    this.onMessageCalled = true;
                }
            }

            const emitter = new CustomEvent();
            const subscriber = emitter.once('test');

            emitter.emit('test', { data: 'test' });
            expect(emitter.onMessageCalled).toBe(true);

            // 验证once只触发一次
            emitter.onMessageCalled = false;
            emitter.emit('test', { data: 'test' });
            expect(emitter.onMessageCalled).toBe(false);

            subscriber.off();
        });

        test('onAny方法未指定监听器时应调用onMessage', () => {
            class CustomEvent extends FastEvent {
                onMessageCalled = false;
                onMessageType = '';
                onMessage(message: FastEventMessage) {
                    this.onMessageCalled = true;
                    this.onMessageType = message.type;
                }
            }

            const emitter = new CustomEvent();
            const subscriber = emitter.onAny();

            emitter.emit('test1', { data: 'test1' });
            expect(emitter.onMessageCalled).toBe(true);
            expect(emitter.onMessageType).toBe('test1');

            emitter.onMessageCalled = false;
            emitter.emit('test2', { data: 'test2' });
            expect(emitter.onMessageCalled).toBe(true);
            expect(emitter.onMessageType).toBe('test2');

            subscriber.off();
        });

        test('继承FastEvent并重写onMessage方法应正确处理事件', () => {
            class CustomEvent extends FastEvent {
                messages: FastEventMessage[] = [];
                onMessage(message: FastEventMessage) {
                    this.messages.push(message);
                }
            }

            const emitter = new CustomEvent();
            const subscriber = emitter.on('test');

            emitter.emit('test', { data: 'test1' });
            emitter.emit('test', { data: 'test2' });

            expect(emitter.messages.length).toBe(2);
            expect(emitter.messages[0].payload.data).toBe('test1');
            expect(emitter.messages[1].payload.data).toBe('test2');

            subscriber.off();
        });
    });

});