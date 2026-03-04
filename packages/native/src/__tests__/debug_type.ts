/* eslint-disable no-unused-vars */
import { FastEvent } from "../event";
import { FastEventScope } from "../scope";
import type { Equal, Expect } from "@type-challenges/utils";

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
class MyScope extends FastEventScope<MyScopeEvents> {
    test() {}
}
class MyScopeWithMeta extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

const emitter = new FastEvent({
    meta: {
        root: 100,
    },
});

const myScope = emitter.scope("modules/my", new MyScope());
const myScope2 = emitter.scope("modules/my", new MyScopeWithMeta());
myScope.test();
// 测试 payload 类型
myScope.on("a", (message) => {
    type A = Expect<Equal<typeof message.type, "a">>;

    type PayloadType = typeof message.payload;

    // 测试1: payload应该是number
    type Test1 = Expect<Equal<PayloadType, number>>;

    // 测试2: 检查payload是否为any（如果是any说明类型推断失败）
    type IsAny<T> = 0 extends 1 & T ? true : false;
    type Test2 = Expect<Equal<IsAny<PayloadType>, false>>;
});

// 测试b事件
myScope.on("b", (message) => {
    type PayloadType = typeof message.payload;
    type Test1 = Expect<Equal<PayloadType, string>>;
});
myScope2.on("a", (message) => {
    type A = Expect<Equal<typeof message.type, "a">>;
    type PayloadType = typeof message.payload;

    // 测试1: payload应该是number
    type Test1 = Expect<Equal<PayloadType, number>>;

    // 测试2: 检查payload是否为any（如果是any说明类型推断失败）
    type IsAny<T> = 0 extends 1 & T ? true : false;
    type Test2 = Expect<Equal<IsAny<PayloadType>, false>>;
});
