/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope, FastEventScopeMeta } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

type MyScopeEvents = {
    a: number;
    b: string;
    c: boolean;
};

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

const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

// 调用 scope 方法
const myScope = emitter.scope('modules/my', new MyScope());

// 测试 message 类型
myScope.on('a', (message) => {
    // 检查 message.type
    type TypeType = typeof message.type;
    type Test1 = Expect<Equal<TypeType, 'a'>>;

    // 检查 message.payload
    type PayloadType = typeof message.payload;
    type Test2 = Expect<Equal<PayloadType, number>>;

    // 检查 message.meta
    type MetaType = typeof message.meta;
    type Test3 = Expect<Equal<MetaType, MyScopeMeta & { root: number } & FastEventScopeMeta & Record<string, any>>>;
});
