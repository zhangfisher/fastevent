/* eslint-disable no-unused-vars */
import { describe, test } from 'vitest';
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

describe('测试在函数内的类型推断', () => {
    test('基本测试', () => {
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

        // 检查 test 方法
        type HasTest = 'test' extends keyof typeof myScope ? true : false;
        type Test1 = Expect<Equal<HasTest, true>>;

        // 检查 payload 类型
        myScope.on('a', (message) => {
            type PayloadType = typeof message.payload;
            type Test2 = Expect<Equal<PayloadType, number>>;
        });
    });
});
