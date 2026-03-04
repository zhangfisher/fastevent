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

// 提取类型
type ExtractScopeEvents<T> = T extends FastEventScope<infer Events, any, any> ? Events : Record<string, any>;
type ExtractScopeMeta<T> = T extends FastEventScope<any, infer Meta, any> ? Meta : Record<string, any>;

// 测试提取
type Events1 = ExtractScopeEvents<MyScope1>;
type Events2 = ExtractScopeEvents<MyScope2>;
type Meta1 = ExtractScopeMeta<MyScope1>;
type Meta2 = ExtractScopeMeta<MyScope2>;

// 验证提取结果
type TestEvents1 = Expect<Equal<Events1, MyScopeEvents>>;
type TestEvents2 = Expect<Equal<Events2, MyScopeEvents>>;
type TestMeta1 = Expect<Equal<Meta1, Record<string, any>>>;
type TestMeta2 = Expect<Equal<Meta2, MyScopeMeta>>;

// 现在测试实际的 scope 方法
const emitter = new FastEvent();

const scope1 = emitter.scope('test1', new MyScope1());
const scope2 = emitter.scope('test2', new MyScope2());

// 检查 scope 的类型
type Scope1Type = typeof scope1;
type Scope2Type = typeof scope2;

// 测试 on 方法的类型推断
scope1.on('a', (message) => {
    type Payload1 = typeof message.payload;
    type Test1 = Expect<Equal<Payload1, number>>;
});

scope2.on('a', (message) => {
    type Payload2 = typeof message.payload;
    type Test2 = Expect<Equal<Payload2, number>>;
});
