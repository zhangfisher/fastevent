/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastMessagePayload, TypedFastEventMessage } from "../../types/FastEventMessages";
import { IsTransformedEvent } from "../../types/transformed/IsTransformedEvent";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { ValueOf } from "../../types/utils/ValueOf";
import { FastEventMessageExtends, GetClosestEvents } from "../../types";
import { FastEventMeta } from "../../types/FastEventMessages";
import { FastEventIterator } from "../../iterator";

type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("返回迭代器的FaseEvent类型系统测试", () => {
    test("常规类型测试", async () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "x/y/z/a": 1;
            "x/y/z/b": 2;
            "x/y/z/c": 3;
        }
        const emitter = new FastEvent<Events>();
        const aMessages = emitter.on("a");
        type A1 = ValueOf<GetClosestEvents<Events, "a">>;

        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], "a">>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<Equal<AMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];

        const anyMessages = emitter.onAny();
        type AnyMeta1 = typeof emitter.types.meta;

        type AnyMessageType = IteratorMessage<typeof anyMessages>;
        type AType = Extract<AnyMessageType, { type: "a" }>;
        type cases = [
            Expect<
                Equal<
                    AType,
                    {
                        type: "a";
                        payload: boolean;
                        meta?: (FastEventMeta & Record<string, any>) | undefined;
                    } & FastEventMessageExtends
                >
            >,
        ];
        // 未定义类型的事件
        const xMessages = emitter.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;

        type XCases = [
            Expect<Equal<XMessageType["type"], "xyz">>,
            Expect<Equal<XMessageType["payload"], any>>,
            Expect<Equal<XMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];
    });

    test("含*和**通配符事件类型", () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "div/*/click": { x: number; y: number };
            "users/*/login": string;
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
            "*": { data: any };
            "**": Record<string, any>;
        }
        const emitter = new FastEvent<Events>();
        // 精确匹配
        const aMessages = emitter.on("a");
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], "a">>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<Equal<AMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];

        const loginMessages = emitter.on("users/fisher/login");
        type LoginMessageType = IteratorMessage<typeof loginMessages>;
        type LoginCases = [
            Expect<Equal<LoginMessageType["type"], `users/fisher/login`>>,
            Expect<Equal<LoginMessageType["payload"], string>>,
            Expect<
                Equal<LoginMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>
            >,
        ];
        // 未声明式的事件
        const XLoginMessages = emitter.on("users/fisher/login/xxx");
        type XLoginMessageType = IteratorMessage<typeof XLoginMessages>;
        type XLoginCases = [
            Expect<Equal<XLoginMessageType["type"], "users/fisher/login/xxx">>,
            Expect<Equal<XLoginMessageType["payload"], Record<string, any>>>,
            Expect<
                Equal<XLoginMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>
            >,
        ];
        const xMessages = emitter.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;
        type XCases = [
            Expect<Equal<XMessageType["type"], `xyz`>>,
            Expect<Equal<XMessageType["payload"], { data: any }>>,
            Expect<Equal<XMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];
    });
    test("部份事件经过转换", () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();

        const aMessages = emitter.on("a");
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], `a`>>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<Equal<AMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];
        // b事件经过转换
        const bMessages = emitter.on("b");
        type BMessageType = IteratorMessage<typeof bMessages>;
        type BCases = [Expect<Equal<BMessageType, number>>];

        // c事件经过转换
        const cMessages = emitter.on("c");
        type CMessageType = IteratorMessage<typeof cMessages>;
        type CBCases = [Expect<Equal<CMessageType, { x: number; y: number }>>];
    });
    test("转换全部事件经过转换", () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();

        const aMessages = emitter.on("a");
        type AMessageType = IteratorMessage<typeof aMessages>;
        // b事件经过转换
        const bMessages = emitter.on("b");
        type BMessageType = IteratorMessage<typeof bMessages>;
        // c事件经过转换
        const cMessages = emitter.on("c");
        type CMessageType = IteratorMessage<typeof cMessages>;

        // 未定义类型的事件
        const xMessages = emitter.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;
        type Cases = [
            Expect<Equal<AMessageType, boolean>>,
            Expect<Equal<BMessageType, number>>,
            Expect<Equal<CMessageType, { x: number; y: number }>>,
            // x未声明NotPayload
            Expect<Equal<XMessageType["type"], "xyz">>,
            Expect<Equal<XMessageType["payload"], any>>,
            Expect<Equal<XMessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": NotPayload<number>;
        }
        const emitter = new FastEvent<Events>();
        const messages = emitter.on("a/1/c/2/d/3/e/4/g/5");
        type MessageType = IteratorMessage<typeof messages>;
        type T1 = GetClosestEvents<Events, "a/1/c/2/d/3/e/4/g/5">;
        type T2 = IsTransformedEvent<Events, "a/1/c/2/d/3/e/4/g/5">;

        const anyMessages = emitter.on("a/1/c/2/dd/3/ee");
        type AnyMessageType = IteratorMessage<typeof anyMessages>;
        type IsTransformed = IsTransformedEvent<Events, "a/1/c/2/dd/3/ee">;
        type M1 = TypedFastEventMessage<Record<"a/*/c/**", FastMessagePayload<number>>>;
        type M2 = GetClosestEvents<Events, "a/1/c/2/dd/3/ee", Record<"a/1/c/2/dd/3/ee", any>>;

        type Cases = [
            Expect<Equal<AnyMessageType, number>>,
            // 没有使用NotPayload
            Expect<Equal<MessageType["type"], "a/1/c/2/d/3/e/4/g/5">>,
            Expect<Equal<MessageType["payload"], string>>,
            Expect<Equal<MessageType["meta"], (FastEventMeta & Record<string, any>) | undefined>>,
        ];
    });
});
