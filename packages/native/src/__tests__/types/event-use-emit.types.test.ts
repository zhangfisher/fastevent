/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventEmitMessage } from "../../types/FastEventMessages";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { MutableMessage, GetPayload } from "../../types";
import { FastEventMeta, TypedFastEventMessage } from "../../types/FastEventMessages";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";
import { FastEventIterator } from "../../utils/eventIterator";
import { Overloads } from "./utils";
import { AllowCall, GetMatchingOverload } from "../../types/utils/AllowCall";

type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("emit 触发事件类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any>>>,
            ];
        });
        const aSubscriber = emitter.emit("a");
        const bSubscriber = emitter.emit("a/b");

        type cases = [
            Expect<Equal<typeof aSubscriber, any[]>>,
            Expect<Equal<typeof bSubscriber, any[]>>,
        ];
        emitter.emit("aaa");
        emitter.emit({
            type: "aa",
            payload: 1,
        });
    });

    test("常规类型测试", () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "x/y/z/a": 1;
            "x/y/z/b": 2;
            "x/y/z/c": 3;
        }
        const emitter = new FastEvent<Events>();
        type event = Parameters<typeof emitter.on>[0];

        // 事件名称类型
        type EmitMethods = Overloads<typeof emitter.emit>;
        type EmitCount = EmitMethods["length"];

        type Arg1 = Parameters<EmitMethods[0]>[0];
        type Arg2 = Parameters<EmitMethods[1]>[0];
        type Arg3 = Parameters<EmitMethods[2]>[0];
        type Arg4 = Parameters<EmitMethods[3]>[0];
        type OS = Overloads<typeof emitter.emit>;
        type O1 = GetMatchingOverload<Overloads<typeof emitter.emit>, [{ type: "a"; payload: 1 }]>;
        type OA1 = AllowCall<typeof emitter.emit, [{ type: "a"; payload: 1 }]>;

        emitter.emit("a", true);
        emitter.emit("b", 1);
        emitter.emit("c", "");
        emitter.emit("x/y/z/a", 1);
        emitter.emit("x/y/z/b", 2);
        emitter.emit("x/y/z/c", 3);

        type M1 = MutableMessage<Events, { a: 1 }>;
        type cases = [
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "a"; payload: true }]>, true>>,
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "b"; payload: 1 }]>, true>>,
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "c"; payload: "true" }]>, true>>,
        ];
        emitter.emit({
            type: "a",
            payload: true,
        });

        // emitter.emit({
        //     type: "a",
        //     payload: 1,
        // });
        // emitter.emit({
        //     type: "b",
        //     payload: 11,
        // });
    });
    test("含通配符事件类型", () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            x: "x1" | "x2" | "x3";
            "div/*/click": { x: number; y: number };
            "users/*/login": "x" | "y" | "z";
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();
        type Messages = MutableMessage<Events>;

        type x1 = AllowCall<typeof emitter.emit, [{ type: "a"; payload: 1 }]>;
        type x2 = AllowCall<typeof emitter.emit, [{ type: "x"; payload: 1 }]>;
        type X21 = GetMatchingOverload<Overloads<typeof emitter.emit>, [{ type: "a"; payload: 1 }]>;
        type MS1 = Exclude<(typeof emitter.types.messages)["type"], "a">;
        type MS2 = "a" extends MS1 ? true : false;
        type cases = [
            // 参数是一个对象{}
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "a"; payload: true }]>, true>>,
            // Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "a"; payload: 1 }]>, false>>,
            // Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "x"; payload: 1 }]>, false>>,
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "x"; payload: "x1" }]>, true>>,
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "x"; payload: "x2" }]>, true>>,
            Expect<Equal<AllowCall<typeof emitter.emit, [{ type: "x"; payload: "x3" }]>, true>>,
        ];
        emitter.emit({
            type: "a",
            payload: true,
        });
        emitter.emit({
            type: "users/vvvvv/login",
            payload: "x", // ✅
        });
        emitter.emit({
            type: "users/abc/login",
            payload: { name: "a", vip: true },
        });

        emitter.emit({
            type: "x",
            payload: "x1",
        });

        emitter.emit({
            type: "div/a/click",
            payload: { x: 1, y: 2 }, // ✅
        });
        emitter.emit("users/x/login", "x"); // ✅ 正确
        emitter.emit("users/3/login", "y"); // ✅ 正确
        emitter.emit("users/x/login", "z"); // ✅ 正确
        emitter.emit("a", true); // ✅
        emitter.emit("x", "x1"); // ✅
        // 未声明的事件
        emitter.emit("xx", "x1"); // ✅
        emitter.emit("xx", 1); // ✅
        emitter.emit("a", true); // ✅
        emitter.emit({
            type: "x",
            payload: "x1",
        });
        // 以下调用会在 IDE 中显示类型错误：

        // emitter.emit("a", 1); // ❌
        // emitter.emit("users/assss/login", 1); // ❌ number 不能赋值给 "x" | "y" | "z"
        // emitter.emit("users/assss/login", ""); // ❌ string 不能赋值给 "x" | "y" | "z"
        // emitter.emit({
        //     type: "a",
        //     payload: 1, // ❌
        // });
        // emitter.emit({
        //     type: "div/button/click",
        //     payload: 1, // ❌
        // });
        // emitter.emit({
        //     type: "users/vvvvv/login",
        //     payload: "xx", // ❌
        // });
        // emitter.emit({
        //     type: "a",
        //     payload: 1, //    ❌
        // });
    });
    test("含*和**通配符事件类型", () => {
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

        emitter.emit("a", true);
        emitter.emit("b", 1);
        emitter.emit("c", "true");
        emitter.emit("div/x/click", { x: 1, y: 1 });
        emitter.emit("users/x/login", "true");
        emitter.emit("users/x/logout", 1);
        emitter.emit("users/x/y", { name: "", vip: true });
        emitter.emit("xyz", { data: 1 });
        emitter.emit("x/y/z", {});
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        emitter.emit("a/1/c/2/d/3/e/4/g/5", "1");
        // emitter.emit("a/*/c/*/d/*/e/*/g/*", 1);
    });
    test("部份事件经过转换", () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();

        type ResultEvents = typeof emitter.types.events;
        type ResultKeyEvents = keyof typeof emitter.types.events;

        emitter.emit("a", true);
        emitter.emit("b", 1);
        emitter.emit("c", { x: 1, y: 2 });
        // 错误
        // emitter.emit("a", 1);
        // emitter.emit("b", true);
        // emitter.emit("c", 1);
        // emitter.emit("a", 2);
    });
    test("转换全部事件经过转换", () => {
        interface Events {
            a: "x" | "y" | "z";
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();

        emitter.emit("a", "x");
        emitter.emit({
            type: "a",
            payload: "x",
        });
        // emitter.emit("a", 1);
        // emitter.emit("a", true);
    });
});
describe("emitAsync 触发事件类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", async () => {
        const emitter = new FastEvent();
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any>>>,
            ];
        });
        await emitter.emitAsync("a");
        await emitter.emitAsync("a/b");

        await emitter.emitAsync("aaa");
        await emitter.emitAsync({
            type: "aa",
            payload: 1,
        });
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
        type event = Parameters<typeof emitter.on>[0];

        await emitter.emitAsync("a", true);
        await emitter.emitAsync("b", 1);
        await emitter.emitAsync("c", "");
        await emitter.emitAsync("x/y/z/a", 1);
        await emitter.emitAsync("x/y/z/b", 2);
        await emitter.emitAsync("x/y/z/c", 3);
        await emitter.emitAsync({
            type: "a",
            payload: true,
        });
        // ❌
        // await emitter.emitAsync({
        //     type: "a",
        //     payload: 1,
        // });
        // await  emitter.emitAsync({
        //     type: "b",
        //     payload:" 11",
        // });
    });
    test("含通配符事件类型", async () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            x: "x1" | "x2" | "x3";
            "div/*/click": { x: number; y: number };
            "users/*/login": "x" | "y" | "z";
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();
        type Messages = MutableMessage<Events>;
        type ddd2 = ExtendWildcardEvents<Events>;
        type AT = Extract<Messages, { type: "a" }>;
        type P1 = GetPayload<Events, "users/a/login">;

        type EventNames = Messages["type"];

        await emitter.emitAsync({
            type: "a",
            payload: true,
        });
        await emitter.emitAsync({
            type: "users/vvvvv/login",
            payload: "x", // ✅
        });
        await emitter.emitAsync({
            type: "users/abc/login",
            payload: { name: "a", vip: true },
        });

        await emitter.emitAsync({
            type: "x",
            payload: "x1",
        });

        await emitter.emitAsync({
            type: "div/a/click",
            payload: { x: 1, y: 2 }, // ✅
        });
        await emitter.emitAsync("users/x/login", "x"); // ✅ 正确
        await emitter.emitAsync("users/3/login", "y"); // ✅ 正确
        await emitter.emitAsync("users/x/login", "z"); // ✅ 正确
        await emitter.emitAsync("a", true); // ✅
        await emitter.emitAsync("x", "x1"); // ✅
        // 未声明的事件
        await emitter.emitAsync("xx", "x1"); // ✅
        await emitter.emitAsync("xx", 1); // ✅
        await emitter.emitAsync("a", true); // ✅
        await emitter.emitAsync({
            type: "x",
            payload: "x1",
        });
        // await   emitter.emitAsync({
        //     type:
        // })
        // 以下调用会在 IDE 中显示类型错误：

        // await  emitter.emitAsync("a", 1); // ❌
        // await  emitter.emitAsync("users/assss/login", 1); // ❌ number 不能赋值给 "x" | "y" | "z"
        // await emitter.emitAsync("users/assss/login", ""); // ❌ string 不能赋值给 "x" | "y" | "z"
        // await   emitter.emitAsync({
        //       type: "a",
        //       payload: 1, // ❌
        //  });
        // await   emitter.emitAsync({
        //     type: "div/button/click",
        //     payload: 1, // ❌
        //   });
        // await  emitter.emitAsync({
        //    type: "users/vvvvv/login",
        //     payload: "xx", // ❌
        //  });
        // await  emitter.emitAsync({
        //     type: "a",
        //     payload: 1, //    ❌
        //  });
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

        await emitter.emitAsync("a", true);
        await emitter.emitAsync("b", 1);
        await emitter.emitAsync("c", "true");
        await emitter.emitAsync("div/x/click", { x: 1, y: 1 });
        await emitter.emitAsync("users/x/login", "true");
        await emitter.emitAsync("users/x/logout", 1);
        await emitter.emitAsync("users/x/y", { name: "", vip: true });
        await emitter.emitAsync("xyz", { data: 1 });
        await emitter.emitAsync("x/y/z", {});
    });
    test("含多段通配符事件类型", async () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        await emitter.emitAsync("a/1/c/2/d/3/e/4/g/5", "1");
        //    ❌
        // await   emitter.emitAsync("a/*/c/*/d/*/e/*/g/*", 1);
    });
    test("部份事件经过转换", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();

        await emitter.emitAsync("a", true);
        await emitter.emitAsync("b", 1);
        await emitter.emitAsync("c", { x: 1, y: 2 });
        // 错误    ❌
        // await  emitter.emitAsync("a", 1);
        // await  emitter.emitAsync("b", true);
        // await  emitter.emitAsync("c", 1);
        // await  emitter.emitAsync("a", 2);
    });
    test("转换全部事件经过转换", async () => {
        interface Events {
            a: "x" | "y" | "z";
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();

        await emitter.emitAsync("a", "x");
        await emitter.emitAsync({
            type: "a",
            payload: "x",
        });
        //    ❌
        // await  emitter.emitAsync("a", 1);
        // await   emitter.emitAsync("a", true);
    });
});
