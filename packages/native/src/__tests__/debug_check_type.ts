/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';

type MyScopeEvents = {
    a: number;
};

type MyScopeMeta = {
    x: number;
};

class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

const emitter = new FastEvent({ meta: { root: 100 } });
const myScope = emitter.scope('modules/my', new MyScope());

// 检查 myScope 的类型
type MyScopeType = typeof myScope;

// 检查是否是 FastEventScope 的实例
type IsFastEventScope = MyScopeType extends FastEventScope<any, any, any> ? true : false;

// 提取 Events
type ExtractedEvents = MyScopeType extends FastEventScope<infer E, any, any> ? E : never;

// 提取 Meta
type ExtractedMeta = MyScopeType extends FastEventScope<any, infer M, any> ? M : never;

// 检查交叉类型部分
type ScopePart = MyScopeType & FastEventScope<MyScopeEvents, MyScopeMeta>;

// 检查 test 方法是否存在
type HasTestMethod = 'test' extends keyof MyScopeType ? true : false;
