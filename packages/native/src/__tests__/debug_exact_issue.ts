/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

// 精确复现测试文件中的场景
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

// 这里是关键：创建 MyScope 实例并传递给 scope
const myScope = emitter.scope('modules/my', new MyScope());

// 测试1：检查 payload 类型
myScope.on('a', (message) => {
    type PayloadTest = Expect<Equal<typeof message.payload, number>>;

    // 如果上面的测试失败，查看实际类型
    type ActualPayload = typeof message.payload;
    type IsPayloadAny = 0 extends 1 & ActualPayload ? true : false;
    type AnyTest = Expect<Equal<IsPayloadAny, false>>;
});

// 测试2：检查 meta 类型
myScope.on('a', (message) => {
    type MetaTest = Expect<
        Equal<
            typeof message.meta,
            MyScopeMeta & { root: number } & Record<string, any> & import('../scope').FastEventScopeMeta
        >
    >;
});

// 测试3：检查 test 方法是否存在
type HasTestMethod = 'test' extends keyof typeof myScope ? true : false;
type MethodTest = Expect<Equal<HasTestMethod, true>>;
