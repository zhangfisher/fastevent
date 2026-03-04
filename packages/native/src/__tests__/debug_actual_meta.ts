/* eslint-disable no-unused-vars */
import { describe, test } from 'vitest';
import { FastEvent, FastEventMeta } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

describe('检查实际的 meta 类型', () => {
    test('打印实际的 meta 类型', () => {
        type MyScopeEvents = {
            a: number;
        };

        type MyScopeMeta = {
            x: number;
        };

        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

        const emitter = new FastEvent({ meta: { root: 100 } });
        const myScope = emitter.scope('modules/my', new MyScope());

        myScope.on('a', (message) => {
            type ActualMeta = typeof message.meta;

            // 检查是否包含所有必需的属性
            type HasRoot = 'root' extends keyof ActualMeta ? true : false;
            type HasX = 'x' extends keyof ActualMeta ? true : false;
            type HasScope = 'scope' extends keyof ActualMeta ? true : false;

            type Test1 = Expect<Equal<HasRoot, true>>;
            type Test2 = Expect<Equal<HasX, true>>;
            type Test3 = Expect<Equal<HasScope, true>>;

            // 尝试不同的顺序
            type Test4 = Expect<
                Equal<
                    ActualMeta,
                    FastEventMeta & { root: number } & FastEventScopeMeta & MyScopeMeta
                >
            >;

            type Test5 = Expect<
                Equal<
                    ActualMeta,
                    FastEventScopeMeta & FastEventMeta & MyScopeMeta & { root: number }
                >
            >;
        });
    });
});
