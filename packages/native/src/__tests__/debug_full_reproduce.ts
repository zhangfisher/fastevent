/* eslint-disable no-unused-vars */
import { describe, test } from 'vitest';
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

describe('完全复现原始测试', () => {
    test('继承作用域类增加自定义元数据 - 完全复现', () => {
        type MyScopeEvents = {
            a: number;
            b: string;
            c: boolean;
        };
        const emitter = new FastEvent({
            meta: {
                root: 100,
            },
        });

        type MyScopeMeta = {
            x: number;
            y: string;
            z: boolean;
        };
        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {
            test(value: number) {
                return 100;
            }
        }

        const myScope = emitter.scope('modules/my', new MyScope());

        myScope.on('a', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'a'>>,
                Expect<Equal<typeof message.payload, number>>,
                Expect<Equal<typeof message.meta, MyScopeMeta & { root: number } & Record<string, any> & import('../scope').FastEventScopeMeta>>,
            ];
        });

        myScope.on('b', (message) => {
            type cases = [
                Expect<Equal<typeof message.type, 'b'>>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, MyScopeMeta & { root: number } & Record<string, any> & import('../scope').FastEventScopeMeta>>,
            ];
        });
    });
});
