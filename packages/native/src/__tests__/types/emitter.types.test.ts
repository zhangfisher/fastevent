/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest";
import type { Equal, Expect, NotAny } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import {
    GetClosestEvents,
    GetMatchedEventPayload,
    Overloads,
    GetMatchedEvents,
    FastEventMeta,
    ExtendWildcardEvents,
    TypedFastEventMessage,
} from "../../types";

describe("FaseEvent类型系统测试", () => {
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
        type T1 = GetClosestEvents<Events, "x">;
        type M1 = TypedFastEventMessage<T1>;
        type fffff = { a: 1 } extends {} ? true : false;
        // 未定义类型的事件
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>,
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
        type f1 = GetMatchedEventPayload<Events, `users/fisher/login`>;
        type f2 = GetMatchedEvents<Events, `users/fisher/login`>;
        type f3 = GetClosestEvents<Events, `users/fisher/login`>;
        type f4 = ResultEvents[`users/fisher/login`];

        type cases = [
            Expect<Equal<ResultEvents["a"], boolean>>,
            Expect<Equal<ResultEvents["b"], number>>,
            Expect<Equal<ResultEvents["div/login/click"], { x: number; y: number }>>,
            Expect<Equal<ResultEvents[`div/${string}/click`], { x: number; y: number }>>,
            //users/fisher/login
            Expect<Equal<`users/fisher/login` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/login` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/login`同时匹配了users/*/login和users/*/*，所以负载是string | {name:string,vip:boolean}
            Expect<
                Equal<
                    GetMatchedEventPayload<Events, `users/fisher/login`>,
                    | string
                    | {
                          name: string;
                          vip: boolean;
                      }
                >
            >,
            //users/fisher/logout
            Expect<Equal<`users/fisher/logout` extends keyof ResultEvents ? true : false, true>>,
            Expect<Equal<`users/${string}/logout` extends keyof ResultEvents ? true : false, true>>,
            // `users/fisher/logout`同时匹配了users/*/login和users/*/*，所以负载是string | {name:string,vip:boolean}
            Expect<
                Equal<
                    GetMatchedEventPayload<Events, `users/fisher/logout`>,
                    | number
                    | {
                          name: string;
                          vip: boolean;
                      }
                >
            >,
        ];

        const subscriber = emitter.on("a", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "a">>,
                Expect<Equal<PayloadType, boolean>>,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
            ];
        });
        type T1 = ExtendWildcardEvents<Events>;
        emitter.on("users/fisher/login", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, `users/${string}/login`>>,
                Expect<Equal<PayloadType, string>>,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
            ];
        });
        emitter.on("users/fisher/online", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type cases = [
                Expect<Equal<EventType, `users/${string}/${string}`>>,
                Expect<
                    Equal<
                        PayloadType,
                        {
                            name: string;
                            vip: boolean;
                        }
                    >
                >,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
            ];
        });
    });
});
