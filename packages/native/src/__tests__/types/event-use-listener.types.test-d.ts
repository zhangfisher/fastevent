/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { GetClosestEventTuple } from "../../types/closest/GetClosestEventRecord";
import { GetClosestEvents, GetClosestEventNameTuple, GetMatchedEventNames } from "../../types";
import { FastEventMeta, TypedFastEventMessage } from "../../types/FastEventMessages";
import { GetClosestEventPayload } from "../../types/closest/GetClosestEventPayload";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";
import { FastEventIterator } from "../../utils/eventIterator";
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("使用监听器的FaseEvent类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        type ScopeEventType = GetClosestEvents<Record<string, any>, "x", Record<"x", any>>;
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<
                    Equal<typeof message.meta, (FastEventMeta & Record<string, any>) | undefined>
                >,
            ];
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
        type ResultEvents = typeof emitter.types.events;
        type cases = [Expect<Equal<Events, ResultEvents>>];

        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>,
            ];
        });
        emitter.on("**", (message) => {
            if (message.type === "a") {
                type cases = Equal<typeof message.payload, boolean>;
            }
            type cases = [
                Expect<
                    Equal<typeof message.type, "a" | "b" | "c" | "x/y/z/a" | "x/y/z/b" | "x/y/z/c">
                >,
                Expect<Equal<typeof message.payload, string | number | boolean>>,
            ];
        });
        emitter.onAny((message) => {
            type cases = [
                Expect<
                    Equal<typeof message.type, "a" | "b" | "c" | "x/y/z/a" | "x/y/z/b" | "x/y/z/c">
                >,
                Expect<Equal<typeof message.payload, string | number | boolean>>,
            ];
        });
        emitter.onAny((message) => {
            if (message.type === "a") {
                type A = Expect<Equal<typeof message.payload, boolean>>;
            } else if (message.type === "b") {
                type A = Expect<Equal<typeof message.payload, number>>;
            } else if (message.type === "c") {
                type A = Expect<Equal<typeof message.payload, string>>;
            } else if (message.type === "x/y/z/a") {
                type A = Expect<Equal<typeof message.payload, 1>>;
            } else if (message.type === "x/y/z/b") {
                type A = Expect<Equal<typeof message.payload, 2>>;
            } else if (message.type === "x/y/z/c") {
                type A = Expect<Equal<typeof message.payload, 3>>;
            }
        });
        type T1 = GetClosestEvents<Events, "x", { a: 1 }>;
        type M1 = TypedFastEventMessage<T1>;
        type fffff = { a: 1 } extends {} ? true : false;
        // 未定义类型的事件
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
    test("含通配符事件类型", () => {
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

        type ResultEvents = typeof emitter.types.events;
        type ResultKeyEvents = keyof typeof emitter.types.events;
        type f1 = GetClosestEventPayload<Events, `users/fisher/login`>;
        type f2 = GetClosestEvents<Events, `users/fisher/login`>;
        type f3 = GetClosestEventNameTuple<Events, `users/fisher/login`>;
        type f4 = ResultEvents[`users/fisher/login`];
        type f51 = GetClosestEventTuple<Events, `users/fisher/login`>[0];
        type f52 = GetClosestEventTuple<Events, `users/fisher/login`>[1];

        type cases = [
            Expect<Equal<ResultEvents["a"], boolean>>,
            Expect<Equal<ResultEvents["b"], number>>,
            Expect<Equal<ResultEvents["div/login/click"], { x: number; y: number }>>,
            Expect<Equal<ResultEvents[`div/${string}/click`], { x: number; y: number }>>,
            //users/fisher/login
            Expect<Equal<`users/fisher/login` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/login` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/login`同时匹配了users/*/login和users/*/*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventTuple<Events, `users/fisher/login`>[1], string>>,
            //users/fisher/logout
            Expect<Equal<`users/fisher/logout` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/logout` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/logout`同时匹配了users/*/login和users/*/*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventTuple<Events, `users/fisher/logout`>[1], number>>,
        ];

        const subscriber = emitter.on("a", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "a">>,
                Expect<Equal<PayloadType, boolean>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        type T1 = ExtendWildcardEvents<Events>;
        emitter.on("users/fisher/login", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, `users/fisher/login`>>,
                Expect<Equal<PayloadType, string>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        emitter.on("users/fisher/online", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type cases = [
                Expect<Equal<EventType, `users/fisher/online`>>,
                Expect<
                    Equal<
                        PayloadType,
                        {
                            name: string;
                            vip: boolean;
                        }
                    >
                >,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        type T2 = GetClosestEvents<Events, "users/fisher/login/xxx">;
        type T3 = TypedFastEventMessage<T2>;
        emitter.on("users/fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "users/fisher/login/xxx">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
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

        type ResultEvents = typeof emitter.types.events;
        type Messages = typeof emitter.types.messages;
        type ResultKeyEvents = keyof ResultEvents;
        type f1 = GetClosestEventPayload<Events, `users/fisher/login`>;
        type f2 = GetMatchedEventNames<Events, `users/fisher/login`>;
        type f3 = GetClosestEvents<Events, `users/fisher/login`>;
        type f4 = ResultEvents[`div/login/click`];
        type f5 = GetClosestEventPayload<Events, `users/fisher/login`>;
        type f6 = GetClosestEventPayload<Events, `users/fisher/logout`>;

        type cases = [
            Expect<Equal<ResultEvents["a"], boolean>>,
            Expect<Equal<ResultEvents["b"], number>>,
            Expect<
                Equal<
                    ResultEvents["div/login/click"],
                    { x: number; y: number } & Record<string, any>
                >
            >,
            Expect<
                Equal<
                    ResultEvents[`div/${string}/click`],
                    { x: number; y: number } & Record<string, any>
                >
            >,
            //users/fisher/login
            Expect<Equal<`users/fisher/login` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/login` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/login`同时匹配了users/*/login，users/*/*， "**"
            // 所以负载是string | {name:string,vip:boolean} | Record<string, any>
            Expect<Equal<GetClosestEventPayload<Events, `users/fisher/login`>, string>>,
            //users/fisher/logout
            Expect<Equal<`users/fisher/logout` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/logout` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/logout`同时匹配了users/*/login和users/*/*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventPayload<Events, `users/fisher/logout`>, number>>,
        ];

        const subscriber = emitter.on("a", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "a">>,
                Expect<Equal<PayloadType, boolean>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        type T1 = ExtendWildcardEvents<Events>;
        emitter.on("users/fisher/login", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, `users/fisher/login`>>,
                Expect<Equal<PayloadType, string>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        emitter.on("users/fisher/online", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type cases = [
                Expect<Equal<EventType, `users/fisher/online`>>,
                Expect<
                    Equal<
                        PayloadType,
                        {
                            name: string;
                            vip: boolean;
                        }
                    >
                >,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        type T2 = GetClosestEvents<Events, "users/fisher/login/xxx">;
        type T21 = GetClosestEventTuple<Events, "users/fisher/login/xxx">;
        type T3 = TypedFastEventMessage<T2>;
        type T4 = GetClosestEvents<
            Events,
            "users/fisher/login/xxx",
            Record<"users/fisher/login/xxx", any>
        >;
        type T5 = TypedFastEventMessage<T4>;

        emitter.on("users/fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "users/fisher/login/xxx">>,
                Expect<Equal<PayloadType, Record<string, any>>>,
                Expect<Equal<MetaType, (FastEventMeta & Record<string, any>) | undefined>>,
            ];
        });
        // 未声明式的事件
        emitter.on("xyz", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "xyz">>,
                Expect<Equal<typeof message.payload, { data: any }>>,
            ];
        });
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        const subscriber = emitter.on("a/1/c/2/d/3/e/4/g/5", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a/1/c/2/d/3/e/4/g/5">>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<
                    Equal<typeof message.meta, (FastEventMeta & Record<string, any>) | undefined>
                >,
            ];
        });
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

        emitter.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>,
            ];
        });
        // b事件经过转换
        emitter.on("b", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, number>>];
        });
        // c事件经过转换
        emitter.on("c", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, { x: number; y: number }>>];
        });
    });
    test("转换全部事件经过转换", () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>; // 允许重复使用NotPayload
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();

        type ResultEvents = typeof emitter.types.events;
        type ResultKeyEvents = keyof typeof emitter.types.events;

        emitter.on("a", (message) => {
            type cases = [Expect<Equal<typeof message, boolean>>];
        });
        // b事件经过转换
        emitter.on("b", (message) => {
            type cases = [Expect<Equal<typeof message, number>>];
        });
        // c事件经过转换
        emitter.on("c", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, { x: number; y: number }>>];
        });
        // 未定义类型的事件
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
});
