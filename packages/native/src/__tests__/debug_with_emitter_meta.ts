/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

type MyScopeEvents = {
    a: number;
};

type MyScopeMeta = {
    x: number;
};

// 场景1：只有一个泛型参数
class MyScope1 extends FastEventScope<MyScopeEvents> {}

// 场景2：有两个泛型参数
class MyScope2 extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

// 关键：emitter 有 meta
const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

const scope1 = emitter.scope('test1', new MyScope1());
const scope2 = emitter.scope('test2', new MyScope2());

// 测试 payload 类型
scope1.on('a', (message) => {
    type Payload1 = typeof message.payload;
    type Test1 = Expect<Equal<Payload1, number>>;
});

scope2.on('a', (message) => {
    type Payload2 = typeof message.payload;
    type Test2 = Expect<Equal<Payload2, number>>;
});

// 测试 meta 类型
scope1.on('a', (message) => {
    type Meta1 = typeof message.meta;
    type Test1 = Expect<Equal<Meta1, { root: number } & Record<string, any> & import('../scope').FastEventScopeMeta>>;
});

scope2.on('a', (message) => {
    type Meta2 = typeof message.meta;
    type Test2 = Expect<Equal<Meta2, MyScopeMeta & { root: number } & Record<string, any> & import('../scope').FastEventScopeMeta>>;
});
