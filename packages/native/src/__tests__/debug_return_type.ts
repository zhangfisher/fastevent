/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
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

const emitter = new FastEvent({ meta: { root: 100 } });
const myScope = emitter.scope('modules/my', new MyScope());

// 检查 myScope 是否有 test 方法
type HasTest = 'test' extends keyof typeof myScope ? true : false;
type Test1 = Expect<Equal<HasTest, true>>;

// 检查 test 方法的参数类型
type TestParams = Parameters<typeof myScope.test>;
type Test2 = Expect<Equal<TestParams, [number]>>;

// 检查 on 方法
myScope.on('a', (message) => {
    type PayloadType = typeof message.payload;
    type MetaType = typeof message.meta;
    type Test3 = Expect<Equal<PayloadType, number>>;
});
