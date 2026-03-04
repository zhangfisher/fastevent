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

class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

// 不带 meta 的 emitter
const emitter1 = new FastEvent();
const scope1 = emitter1.scope('test', new MyScope());

// 带 meta 的 emitter
const emitter2 = new FastEvent({ meta: { root: 100 } });
const scope2 = emitter2.scope('test', new MyScope());

// 提取 scope 的类型
type Scope1Type = typeof scope1;
type Scope2Type = typeof scope2;

// 手动提取 FastEventScope 的泛型参数
type ExtractEvents<T> = T extends FastEventScope<infer E, any, any> ? E : never;
type ExtractMeta<T> = T extends FastEventScope<any, infer M, any> ? M : never;

// 由于 scope1 和 scope2 是交叉类型，我们需要从交叉类型中提取 FastEventScope 部分
// 但这很复杂，让我们换一个方法

// 直接测试 on 方法的参数类型
scope1.on('a', (message) => {
    type Msg1 = typeof message;
    type Payload1 = typeof message.payload;
    type Meta1 = typeof message.meta;

    type Test1 = Expect<Equal<Payload1, number>>;
});

scope2.on('a', (message) => {
    type Msg2 = typeof message;
    type Payload2 = typeof message.payload;
    type Meta2 = typeof message.meta;

    type Test2 = Expect<Equal<Payload2, number>>;
});

// 让我检查 FastEventScope 的类型定义
// 查看 scope.on 方法的签名
type OnMethod<T> = T extends { on: infer O } ? O : never;

// 从 FastEventScope<MyScopeEvents, MyScopeMeta> 中提取 on 方法
type PureScopeOn = FastEventScope<MyScopeEvents, MyScopeMeta>['on'];

// 检查纯类型的 on 方法
type TestPure = OnMethod<FastEventScope<MyScopeEvents, MyScopeMeta>>;
