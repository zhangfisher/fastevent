/* eslint-disable no-unused-vars */
import { describe, test } from 'vitest';
import { FastEvent } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

describe('精确测试 meta 类型', () => {
    test('检查 meta 是否包含所有必需部分', () => {
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
            // 检查 payload
            type PayloadTest = Expect<Equal<typeof message.payload, number>>;

            // 检查 meta 的各个部分
            type MetaType = typeof message.meta;

            // 检查是否有 root
            type HasRoot = 'root' extends keyof MetaType ? true : false;
            type RootTest = Expect<Equal<HasRoot, true>>;

            // 检查是否有 x
            type HasX = 'x' extends keyof MetaType ? true : false;
            type XTest = Expect<Equal<HasX, true>>;

            // 检查是否有 scope
            type HasScope = 'scope' extends keyof MetaType ? true : false;
            type ScopeTest = Expect<Equal<HasScope, true>>;

            // 完整的 meta 类型检查
            type FullMetaTest = Expect<
                Equal<
                    MetaType,
                    MyScopeMeta & { root: number } & Record<string, any> & FastEventScopeMeta
                >
            >;
        });
    });
});
