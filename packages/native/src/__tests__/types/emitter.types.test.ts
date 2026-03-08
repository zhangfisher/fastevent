/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import {
    IsTransformedKey,
    MutableEvents,
    NotPayload,
    RecordValues,
    ScopeEvents,
    TransformedEvents,
} from "../../types/index";
import {
    GetClosestEvents,
    GetMatchedEventPayload,
    GetMatchedEvents,
    FastEventMeta,
    ExtendWildcardEvents,
    TypedFastEventMessage,
} from "../../types";
import { FastEventIterator } from "../../utils/eventIterator";
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("使用监听器的FaseEvent类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        type ScopeEventType = GetClosestEvents<Record<string, any>, "x", Record<"x", any>>;
        emitter.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<Equal<typeof message.meta, FastEventMeta & Record<string, any>>>,
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
        type A1 = RecordValues<GetClosestEvents<Events, "a">>;

        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], "a">>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<Equal<AMessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];

        const anyMessages = emitter.onAny();
        type Any1 = MutableEvents<typeof emitter.types.events>;
        type AnyMeta1 = typeof emitter.types.meta;

        type AnyMessageType = IteratorMessage<typeof anyMessages>;
        type AnyKeys = AnyMessageType;
        type cases = [
            Expect<
                Equal<
                    Extract<AnyMessageType, { type: "a" }>,
                    { type: "a"; payload: boolean; meta: Record<string, any> & FastEventMeta }
                >
            >,
        ];
        // 未定义类型的事件
        const xMessages = emitter.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;

        type XCases = [
            Expect<Equal<XMessageType["type"], "xyz">>,
            Expect<Equal<XMessageType["payload"], any>>,
            Expect<Equal<XMessageType["meta"], FastEventMeta & Record<string, any>>>,
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
            Expect<Equal<AMessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];

        const loginMessages = emitter.on("users/fisher/login");
        type LoginMessageType = IteratorMessage<typeof loginMessages>;
        type LoginCases = [
            Expect<Equal<LoginMessageType["type"], `users/${string}/login`>>,
            Expect<Equal<LoginMessageType["payload"], string>>,
            Expect<Equal<LoginMessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];
        // 未声明式的事件
        const XLoginMessages = emitter.on("users/fisher/login/xxx");
        type XLoginMessageType = IteratorMessage<typeof XLoginMessages>;
        type XLoginCases = [
            Expect<Equal<XLoginMessageType["type"], string>>,
            Expect<Equal<XLoginMessageType["payload"], Record<string, any>>>,
            Expect<Equal<XLoginMessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];
        const xMessages = emitter.on("xyz");
        type XMessageType = IteratorMessage<typeof loginMessages>;
        type XCases = [
            Expect<Equal<XMessageType["type"], `users/${string}/login`>>,
            Expect<Equal<XMessageType["payload"], string>>,
            Expect<Equal<XMessageType["meta"], FastEventMeta & Record<string, any>>>,
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
            Expect<Equal<AMessageType["meta"], FastEventMeta & Record<string, any>>>,
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
            Expect<Equal<XMessageType["meta"], FastEventMeta & Record<string, any>>>,
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

        const anyMessages = emitter.on("a/1/c/2/dd/3/ee");
        type AnyMessageType = IteratorMessage<typeof anyMessages>;

        type T1 = GetClosestEvents<Events, "a/1/c/2/d/3/e/4/g/5">;
        type T2 = IsTransformedKey<Events, "a/1/c/2/d/3/e/4/g/5">;
        type Cases = [
            Expect<Equal<AnyMessageType, number>>,
            // 没有使用NotPayload
            Expect<
                Equal<
                    MessageType["type"],
                    `a/${string}/c/${string}/d/${string}/e/${string}/g/${string}`
                >
            >,
            Expect<Equal<MessageType["payload"], string>>,
            Expect<Equal<MessageType["meta"], FastEventMeta & Record<string, any>>>,
        ];
    });
});
