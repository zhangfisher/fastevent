/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

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

// 场景1：只有一个泛型参数（应该通过）
class MyScope1 extends FastEventScope<MyScopeEvents> {}
const myScope1 = emitter.scope('test1', new MyScope1());

myScope1.on('a', (message) => {
    type PayloadTest = Expect<Equal<typeof message.payload, number>>;
});

// 场景2：有两个泛型参数（可能失败）
type MyScopeMeta = {
    x: number;
    y: string;
    z: boolean;
};

class MyScope2 extends FastEventScope<MyScopeEvents, MyScopeMeta> {}
const myScope2 = emitter.scope('test2', new MyScope2());

myScope2.on('a', (message) => {
    type PayloadTest = Expect<Equal<typeof message.payload, number>>;
});
