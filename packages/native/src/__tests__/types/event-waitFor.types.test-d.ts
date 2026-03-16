/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { GetClosestEventTuple } from "../../types/closest/GetClosestEventRecord";
import { GetClosestEvents, FastEventMessage, MutableMessage } from "../../types";
import { FastEventMeta, TypedFastEventMessage } from "../../types/FastEventMessages";
import { GetClosestEventPayload } from "../../types/closest/GetClosestEventPayload";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";
import { FastEventIterator } from "../../utils/eventIterator";
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("FaseEvent.waitFor类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", async () => {
        const emitter = new FastEvent();
        type ScopeEventType = GetClosestEvents<Record<string, any>, "x", Record<"x", any>>;
        const result = await emitter.waitFor("x");
        type cases = [Expect<Equal<typeof result, FastEventMessage<"x", any>>>];
    });

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

        const R1 = await emitter.waitFor("a");
        const R2 = await emitter.waitFor("b");
        const R3 = await emitter.waitFor("c");
        const R4 = await emitter.waitFor("x/y/z/a");
        const R5 = await emitter.waitFor("x/y/z/b");
        const R6 = await emitter.waitFor("x/y/z/c");

        type R1Type = typeof R1;
        type R1Type2 = FastEventMessage<"a", boolean, Record<string, any>>;

        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"a", boolean>>>,
            Expect<Equal<typeof R2, FastEventMessage<"b", number>>>,
            Expect<Equal<typeof R3, FastEventMessage<"c", string>>>,
            Expect<Equal<typeof R4, FastEventMessage<"x/y/z/a", 1>>>,
            Expect<Equal<typeof R5, FastEventMessage<"x/y/z/b", 2>>>,
            Expect<Equal<typeof R6, FastEventMessage<"x/y/z/c", 3>>>,
        ];
    });
    test("含通配符事件类型", async () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "div/*/click": { x: number; y: number };
            "users/*/login": string;
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();
        type Messages = MutableMessage<Events>;
        type M1 = MutableMessage<Events>;
        type M2 = GetClosestEvents<Events, "div/a/click">;
        type M3 = GetClosestEventPayload<Events, "div/a/click">;
        const R1 = await emitter.waitFor("a");
        const R2 = await emitter.waitFor("b");
        const R3 = await emitter.waitFor("c");
        const R4 = await emitter.waitFor("div/a/click");
        type R4Type = FastEventMessage<"div/a/click", { x: 1; y: 2 }>;
        const R5 = await emitter.waitFor("users/xxx/login");
        const R6 = await emitter.waitFor("users/xxx/logout");
        const R7 = await emitter.waitFor("users/x/y");

        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"a", boolean>>>,
            Expect<Equal<typeof R2, FastEventMessage<"b", number>>>,
            Expect<Equal<typeof R3, FastEventMessage<"c", string>>>,
            Expect<Equal<typeof R4, FastEventMessage<"div/a/click", { x: number; y: number }>>>,
            Expect<Equal<typeof R5, FastEventMessage<"users/xxx/login", string>>>,
            Expect<Equal<typeof R6, FastEventMessage<"users/xxx/logout", number>>>,
            Expect<Equal<typeof R7, FastEventMessage<"users/x/y", { name: string; vip: boolean }>>>,
        ];
    });
    test("含*和**通配符事件类型", async () => {
        type Events = {
            a: boolean;
            b: number;
            c: string;
            "div/*/click": { x: number; y: number };
            "users/*/login": string;
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
            "*": { data: any };
            "**": Record<string, any>;
        };
        const emitter = new FastEvent<Events>();

        const R1 = await emitter.waitFor("a");
        const R2 = await emitter.waitFor("b");
        const R3 = await emitter.waitFor("c");
        const R4 = await emitter.waitFor("div/a/click");
        const R5 = await emitter.waitFor("users/fisher/login");
        const R6 = await emitter.waitFor("users/fisher/logout");
        const R7 = await emitter.waitFor("users/x/y");
        const R8 = await emitter.waitFor("xxx");
        const R9 = await emitter.waitFor("x/y/z");

        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"a", boolean>>>,
            Expect<Equal<typeof R2, FastEventMessage<"b", number>>>,
            Expect<Equal<typeof R3, FastEventMessage<"c", string>>>,
            Expect<Equal<typeof R4, FastEventMessage<"div/a/click", { x: number; y: number }>>>,
            Expect<Equal<typeof R5, FastEventMessage<"users/fisher/login", string>>>,
            Expect<Equal<typeof R6, FastEventMessage<"users/fisher/logout", number>>>,
            Expect<Equal<typeof R7, FastEventMessage<"users/x/y", { name: string; vip: boolean }>>>,
            Expect<Equal<typeof R8, FastEventMessage<"xxx", { data: any }>>>,
            Expect<Equal<typeof R9, FastEventMessage<"x/y/z", Record<string, any>>>>,
        ];
    });
    test("含多段通配符事件类型", async () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        const R1 = await emitter.waitFor("a/x/c/y");
        const R2 = await emitter.waitFor("a/x/c/y/z");
        const R3 = await emitter.waitFor("a/x/c/y/z/abc");
        const R4 = await emitter.waitFor("a/1/c/1/d/1/e/1/g/1");
        const R5 = await emitter.waitFor("a/2/c/2/d/2/e/2/g/2");
        const R6 = await emitter.waitFor("a/3/c/3/d/3/e/3/g/3");

        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"a/x/c/y", number>>>,
            Expect<Equal<typeof R2, FastEventMessage<"a/x/c/y/z", number>>>,
            Expect<Equal<typeof R3, FastEventMessage<"a/x/c/y/z/abc", number>>>,
            Expect<Equal<typeof R4, FastEventMessage<"a/1/c/1/d/1/e/1/g/1", string>>>,
            Expect<Equal<typeof R5, FastEventMessage<"a/2/c/2/d/2/e/2/g/2", string>>>,
            Expect<Equal<typeof R6, FastEventMessage<"a/3/c/3/d/3/e/3/g/3", string>>>,
        ];
    });
    test("部份事件经过转换", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();
        const R1 = await emitter.waitFor("a");
        const R2 = await emitter.waitFor("b");
        const R3 = await emitter.waitFor("c");
        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"a", boolean>>>,
            Expect<Equal<typeof R2, number>>,
            Expect<Equal<typeof R3, { x: number; y: number }>>,
        ];
    });
    test("转换全部事件经过转换", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();
        const R1 = await emitter.waitFor("a");
        const R2 = await emitter.waitFor("b");
        const R3 = await emitter.waitFor("c");
        type cases = [
            Expect<Equal<typeof R1, boolean>>,
            Expect<Equal<typeof R2, number>>,
            Expect<Equal<typeof R3, { x: number; y: number }>>,
        ];
    });
    test("未声明的事件", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();
        const R1 = await emitter.waitFor("x");
        const R2 = await emitter.waitFor("y");
        const R3 = await emitter.waitFor("z");
        type cases = [
            Expect<Equal<typeof R1, FastEventMessage<"x", any>>>,
            Expect<Equal<typeof R2, FastEventMessage<"y", any>>>,
            Expect<Equal<typeof R3, FastEventMessage<"z", any>>>,
        ];
    });
});
