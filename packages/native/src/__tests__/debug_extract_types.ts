/* eslint-disable no-unused-vars */
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

class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

// 测试提取类型
type ExtractScopeEvents<T> =
    T extends FastEventScope<infer Events, any, any> ? Events : Record<string, any>;

type ExtractScopeMeta<T> =
    T extends FastEventScope<any, infer Meta, any> ? Meta : Record<string, any>;

type ExtractedEvents = ExtractScopeEvents<MyScope>;
type ExtractedMeta = ExtractScopeMeta<MyScope>;

type Test1 = Expect<Equal<ExtractedEvents, MyScopeEvents>>;
type Test2 = Expect<Equal<ExtractedMeta, MyScopeMeta>>;

// 测试 on 方法的类型
type OnMethod<T> = T extends { on: infer O } ? O : never;

type MyScopeOn = MyScope['on'];
