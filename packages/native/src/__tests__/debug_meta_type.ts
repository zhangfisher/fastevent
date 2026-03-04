import { FastEvent } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import { FastEventMeta } from '../types';
import type { Expect, Equal } from '@type-challenges/utils';

const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

type MyScopeEvents = {
    a: number;
    b: string;
};

type MyScopeMeta = {
    x: number;
    y: string;
    z: boolean;
};

class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

const myScope = emitter.scope('modules/my', new MyScope());

// 检查 message.meta 的实际类型
myScope.on('a', (message) => {
    type ActualMeta = typeof message.meta;

    // 尝试不同的类型组合
    type Test1 = Expect<Equal<ActualMeta, { root: number } & MyScopeMeta & FastEventMeta & Record<string, any> & FastEventScopeMeta>>;
    type Test2 = Expect<Equal<ActualMeta, MyScopeMeta & { root: number } & FastEventMeta & Record<string, any> & FastEventScopeMeta>>;
});

// 导出供外部检查
export type MyScopeMetaType = typeof myScope;
