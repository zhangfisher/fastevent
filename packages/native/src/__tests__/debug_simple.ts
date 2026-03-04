/* eslint-disable no-unused-vars */
import { FastEvent } from '../event';
import { FastEventScope } from '../scope';
import type { Equal, Expect } from '@type-challenges/utils';

type MyScopeEvents = {
    a: number;
};

class MyScope extends FastEventScope<MyScopeEvents> {}

const emitter = new FastEvent();

// 测试1：直接创建 scope（不使用自定义类）
const scope1 = emitter.scope('test');
scope1.on('a', (message) => {
    type Test = Expect<Equal<typeof message.payload, any>>;
});

// 测试2：使用自定义类
const scope2 = emitter.scope('test', new MyScope());
scope2.on('a', (message) => {
    type Test = Expect<Equal<typeof message.payload, number>>;
});
