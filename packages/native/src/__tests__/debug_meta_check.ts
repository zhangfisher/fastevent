/* eslint-disable no-unused-vars */
import { describe, test } from 'vitest';
import { FastEvent } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

describe('测试 FastEventScopeMeta', () => {
    test('检查 meta 类型', () => {
        type MyScopeEvents = {
            a: number;
        };

        type MyScopeMeta = {
            x: number;
        };

        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {
            test(value: number) {
                return 100;
            }
        }

        const emitter = new FastEvent({ meta: { root: 100 } });
        const myScope = emitter.scope('modules/my', new MyScope());

        // 测试1：不检查 FastEventScopeMeta
        myScope.on('a', (message) => {
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type Test1 = Expect<Equal<PayloadType, number>>;
        });

        // 测试2：检查是否包含 FastEventScopeMeta
        myScope.on('a', (message) => {
            type MetaType = typeof message.meta;
            type HasScope = 'scope' extends keyof MetaType ? true : false;
            type Test2 = Expect<Equal<HasScope, true>>;
        });
    });
});
