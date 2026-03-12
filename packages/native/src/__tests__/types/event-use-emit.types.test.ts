/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventEmitMessage } from "../../types/FastEventMessages";
import { IsTransformedEvent } from "../../types/transformed/IsTransformedEvent";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { ValueOf } from "../../types/utils/ValueOf";
import { GetClosestEventTuple } from "../../types/closest/GetClosestEventRecord";
import {
    GetClosestEvents,
    GetClosestEventNameTuple,
    MutableMessage,
    GetMatchedEventNames,
} from "../../types";
import { FastEventMeta, TypedFastEventMessage } from "../../types/FastEventMessages";
import { GetClosestEventPayload } from "../../types/closest/GetClosestEventPayload";
import { ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";
import { FastEventIterator } from "../../utils/eventIterator";
import { Overloads } from "./utils";

type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("emit 触发事件类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
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

        type Arg1 = Parameters<EmitMethods[0]>[0]; //string
        type Arg2 = Parameters<EmitMethods[1]>[0]; // keyof Events
        type Arg3 = Parameters<EmitMethods[2]>[0]; // string
        type Arg4 = Parameters<EmitMethods[3]>[0]; // message

        type GetPayloadType<T extends (...args: any) => any[], E extends keyof Events> = T extends (
            type: E,
            payload: infer payload,
            ...args: any
        ) => any[]
            ? payload
            : never;

        const r = emitter.emit("bddd", Symbol());
        emitter.emit("a", Symbol());
        emitter.emit("a", true);
        emitter.emit("b", 1);
        emitter.emit("c", "");
        emitter.emit("x/y/z/a", 1);
        emitter.emit("x/y/z/b", 2);
        emitter.emit("x/y/z/c", 3);

        type M1 = FastEventEmitMessage<Events, { a: 1 }>;

        emitter.emit({
            type: "a",
            payload: true,
        });
        emitter.emit({
            type: "b",
            payload: 11,
        });
        emitter.emit({
            type: "",
        });
    });
    test("含通配符事件类型", () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "div/*/click": { x: number; y: number };
            "users/*/login": "x" | "y" | "z";
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();
        type ddd = typeof emitter.types.eventNames;
        type MessageType = FastEventEmitMessage<ExtendWildcardEvents<Events>>;
        type MessageKeys = FastEventEmitMessage<ExtendWildcardEvents<Events>>["type"];
        type m2 = MutableMessage<Events>;
        type M1 = FastEventEmitMessage<Events, { a: 1 }>;
        type ddd2 = ExtendWildcardEvents<Events>;
        emitter.emit({
            type: "a",
            payload: true,
        });
        emitter.emit({
            type: "users/vvvvv/login",
            payload: "x",
        });

        emitter.emit({
            type: "users/abc/login",
            payload: { name: "a", vip: true },
        });
        emitter.emit({
            type: "a",
            payload: true,
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
        type ResultKeyEvents = keyof ResultEvents;
        type f1 = GetClosestEventPayload<Events, `users/fisher/login`>;
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
        type T2 = GetClosestEvents<Events, "users/fisher/login/xxx">;
        type T3 = TypedFastEventMessage<T2>;
        emitter.on("users/fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, string>>,
                Expect<Equal<PayloadType, Record<string, any>>>,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
            ];
        });
        // 未声明式的事件
        emitter.on("xyz", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
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
                Expect<
                    Equal<
                        typeof message.type,
                        `a/${string}/c/${string}/d/${string}/e/${string}/g/${string}`
                    >
                >,
                Expect<Equal<typeof message.payload, string>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any>>>,
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
