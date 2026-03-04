/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

type MyScopeEvents = {
    a: number;
};

class MyScope extends FastEventScope<MyScopeEvents> {}

// 测试1：emitter 没有 meta
const emitter1 = new FastEvent();
const scope1 = emitter1.scope('test', new MyScope());

scope1.on('a', (message) => {
    type Test1 = Expect<Equal<typeof message.payload, number>>;
});

// 测试2：emitter 有 meta
const emitter2 = new FastEvent({ meta: { root: 100 } });
const scope2 = emitter2.scope('test', new MyScope());

scope2.on('a', (message) => {
    type Test2 = Expect<Equal<typeof message.payload, number>>;
});

// 测试3：检查 scope 的具体类型
type Scope2Type = typeof scope2;
type ExtractedEvents = Scope2Type extends FastEventScope<infer E, any, any> ? E : never;
type Test3 = Expect<Equal<ExtractedEvents, MyScopeEvents>>;
