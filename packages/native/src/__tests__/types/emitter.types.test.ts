/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest";
import type { Equal, Expect, NotAny } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { NotPayload, RecordValues, TransformedEvents } from "../../types/index";
import {
    GetClosestEvents,
    GetMatchedEventPayload,
    Overloads,
    GetMatchedEvents,
    FastEventMeta,
    ExtendWildcardEvents,
    TypedFastEventMessage,
} from "../../types";
import { FastEventIterator } from "../../utils/eventIterator";
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("使用监听器的FaseEvent类型系统测试", () => {
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
        type T2 = GetClosestEvents<Events, "users/fisher/login/xxx">;
        type T3 = TypedFastEventMessage<T2>;
        emitter.on("users/fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "users/fisher/login/xxx">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
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
            // `users/fisher/login`同时匹配了users/*/login，users/*/*， "**"
            // 所以负载是string | {name:string,vip:boolean} | Record<string, any>
            Expect<
                Equal<
                    GetMatchedEventPayload<Events, `users/fisher/login`>,
                    | string
                    | {
                          name: string;
                          vip: boolean;
                      }
                    | Record<string, any>
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
                    | Record<string, any>
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
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, { data: any }>>,
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
describe("返回迭代器的FaseEvent类型系统测试", () => {
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
        const aMessages = emitter.on("a");
        type A1 = RecordValues<GetClosestEvents<Events, "a">>;
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], "a">>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<Equal<AMessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];

        emitter.onAny((message) => {
            type cases = [
                Expect<
                    Equal<typeof message.type, "a" | "b" | "c" | "x/y/z/a" | "x/y/z/b" | "x/y/z/c">
                >,
                Expect<Equal<typeof message.payload, string | number | boolean>>,
            ];
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
        type T2 = GetClosestEvents<Events, "users/fisher/login/xxx">;
        type T3 = TypedFastEventMessage<T2>;
        emitter.on("users/fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "users/fisher/login/xxx">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & Record<string, any>>>,
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
            // `users/fisher/login`同时匹配了users/*/login，users/*/*， "**"
            // 所以负载是string | {name:string,vip:boolean} | Record<string, any>
            Expect<
                Equal<
                    GetMatchedEventPayload<Events, `users/fisher/login`>,
                    | string
                    | {
                          name: string;
                          vip: boolean;
                      }
                    | Record<string, any>
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
                    | Record<string, any>
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
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, { data: any }>>,
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
