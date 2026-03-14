// oxlint-disable typescript/unbound-method
// oxlint-disable no-unused-expressions
/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest";
import type { Equal, Expect, NotAny } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { FastEventScope, FastEventScopeMeta } from "../../scope";
import { Expand, GetClosestEvents, ScopeEvents } from "../../types";
import { FastEventMessageExtends, FastEventMeta } from "../../types/FastEventMessages";
import { GetClosestEventPayload } from "../../types/closest/GetClosestEventPayload";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { ValueOf } from "../../types/utils/ValueOf";
import { FastEventIterator } from "../../utils/eventIterator";
import { GetMatchedEvents } from "../../types/WildcardEvents";

type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("事件作用域使用监听器类型测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        const scope = emitter.scope("a/b/c");
        type ScopeEventType = ScopeEvents<Record<string, any>, "a/b/c">;
        scope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & FastEventScopeMeta & Record<string, any>
                    >
                >,
            ];
        });
    });

    test("简单的scope事件类型测试", () => {
        type Events = {
            "rooms/1/add": boolean;
            "rooms/1/join": string;
            "rooms/1/leave": number;
            "rooms/2/add": boolean;
            "rooms/2/remove": number;
            "rooms/2/join": string;
            "users/fisher/login": string;
            "users/fisher/logout": number;
        };
        const emitter = new FastEvent<Events>();
        const scope = emitter.scope("rooms/1");
        type scopeKeys = Expand<keyof typeof scope.types.events>;
        // 存在的事件
        scope.on("add", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "add">>,
                Expect<Equal<typeof message.payload, boolean>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & FastEventScopeMeta & Record<string, any>
                    >
                >,
            ];
        });
        // 不存在的事件
        scope.on("xyz", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "xyz">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & FastEventScopeMeta & Record<string, any>
                    >
                >,
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
        const scope = emitter.scope("users");

        type UserScopeRawEvents = typeof scope.types.rawEvents;
        type UserScopeEvents = typeof scope.types.events;
        type UserScopeEventKeys = keyof UserScopeRawEvents;
        type f1 = GetClosestEventPayload<UserScopeRawEvents, `fisher/login`>;
        type f2 = GetMatchedEvents<UserScopeRawEvents, `fisher/login`>;
        type f22 = GetMatchedEvents<UserScopeRawEvents, `fisher/login`>;
        type f3 = GetClosestEvents<UserScopeRawEvents, `fisher/login`>;
        type f41 = GetClosestEventPayload<UserScopeRawEvents, `fisher/login`>;
        type f42 = GetClosestEventPayload<UserScopeRawEvents, `fisher/login`>;
        type cases = [
            Expect<
                Equal<
                    UserScopeEvents["fisher/login"],
                    string & {
                        name: string;
                        vip: boolean;
                    }
                >
            >,
            Expect<
                Equal<
                    keyof UserScopeEvents,
                    `${string}/${string}` | `${string}/login` | `${string}/logout`
                >
            >,
            //users/fisher/login
            Expect<Equal<`fisher/2login` extends keyof UserScopeEvents ? true : false, true>>,
            Expect<Equal<`${string}/login` extends keyof UserScopeEvents ? true : false, true>>,
            // `fisher/login`同时匹配了*/login和*/*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventPayload<UserScopeRawEvents, `fisher/login`>, string>>,
            //fisher/logout
            Expect<Equal<`fisher/logout` extends keyof UserScopeEvents ? true : false, true>>,
            Expect<Equal<`${string}/logout` extends keyof UserScopeEvents ? true : false, true>>,
            // `fisher/logout`同时匹配了 */login和 */*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventPayload<UserScopeRawEvents, `fisher/logout`>, number>>,
        ];

        // 不存在的事件
        const subscriber = scope.on("a", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "a">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("fisher/login", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, `fisher/login`>>,
                Expect<Equal<PayloadType, string>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("fisher/online", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type cases = [
                Expect<Equal<EventType, `fisher/online`>>,
                Expect<
                    Equal<
                        PayloadType,
                        {
                            name: string;
                            vip: boolean;
                        }
                    >
                >,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        // 不匹配的事件
        scope.on("fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "fisher/login/xxx">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("x", (message) => {
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
        const scope = emitter.scope("users");

        type RawEvents = typeof scope.types.rawEvents;
        type UserScopeEvents = typeof scope.types.events;
        type RawEventKeys = keyof RawEvents;
        type f1 = GetClosestEventPayload<RawEvents, `fisher/login`>;
        type f2 = GetMatchedEvents<Events, `fisher/login`>;
        type f3 = GetClosestEvents<Events, `fisher/login`>;
        type f4 = UserScopeEvents[`fisher/login`];

        type cases = [
            //fisher/login
            Expect<Equal<`fisher/login` extends keyof UserScopeEvents ? true : false, true>>,
            Expect<Equal<`${string}/login` extends keyof UserScopeEvents ? true : false, true>>,
            // `fisher/login`同时匹配了*/login，*/*， "**"
            // 所以负载是string | {name:string,vip:boolean} | Record<string, any>
            Expect<Equal<GetClosestEventPayload<Events, `users/fisher/login`>, string>>,
            //fisher/logout
            Expect<Equal<`fisher/logout` extends keyof UserScopeEvents ? true : false, true>>,
            Expect<Equal<`${string}/logout` extends keyof UserScopeEvents ? true : false, true>>,
            // `fisher/logout`同时匹配了*/login和*/*，所以负载是string | {name:string,vip:boolean}
            Expect<Equal<GetClosestEventPayload<RawEvents, `fisher/logout`>, number>>,
        ];

        const subscriber = scope.on("a", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "a">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("fisher/login", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, `fisher/login`>>,
                Expect<Equal<PayloadType, string>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("fisher/online", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;
            type cases = [
                Expect<Equal<EventType, `fisher/online`>>,
                Expect<
                    Equal<
                        PayloadType,
                        {
                            name: string;
                            vip: boolean;
                        }
                    >
                >,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        scope.on("fisher/login/xxx", (message) => {
            type EventType = typeof message.type;
            type PayloadType = typeof message.payload;
            type MetaType = typeof message.meta;

            type cases = [
                Expect<Equal<EventType, "fisher/login/xxx">>,
                Expect<Equal<PayloadType, any>>,
                Expect<Equal<MetaType, FastEventMeta & FastEventScopeMeta & Record<string, any>>>,
            ];
        });
        // 未声明式的事件
        scope.on("xyz", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "xyz">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();

        const scope = emitter.scope("a");
        const subscriber = scope.on("1/c/2/d/3/e/4/g/5", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, `1/c/2/d/3/e/4/g/5`>>,
                Expect<Equal<typeof message.payload, string>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & FastEventScopeMeta & Record<string, any>
                    >
                >,
            ];
        });
    });
    test("部份事件经过转换", () => {
        interface Events {
            "users/a": boolean;
            "users/b": NotPayload<number>;
            "users/c": NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();

        const scope = emitter.scope("users");

        scope.on("a", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, boolean>>,
            ];
        });
        // b事件经过转换
        scope.on("b", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, number>>];
        });
        // c事件经过转换
        scope.on("c", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, { x: number; y: number }>>];
        });
    });
    test("转换全部事件经过转换", () => {
        interface Events {
            "users/a": boolean;
            "users/b": NotPayload<number>;
            "users/c": NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();

        const scope = emitter.scope("users");
        // a事件经过转换
        scope.on("a", (message) => {
            type cases = [Expect<Equal<typeof message, boolean>>];
        });
        // b事件经过转换
        scope.on("b", (message) => {
            type cases = [Expect<Equal<typeof message, number>>];
        });
        // c事件经过转换
        scope.on("c", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, { x: number; y: number }>>];
        });
        // 未定义类型的事件
        scope.on("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });

    test("scope发布通配符事件", () => {
        type Events = {
            "x/users/online": { name: string; status?: number };
            "x/users/*/online": { name: string; status?: number };
            "x/users/*/*": 1;
            "x/users/*/offline": boolean;
            "x/posts/*/online": string;
            "x/posts/**": number;
        };
        const emitter = new FastEvent<Events>();
        emitter.on("x/posts/fisher/online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, `x/posts/fisher/online`>>,
                Expect<Equal<typeof message.payload, string>>,
            ];
        });

        // 不需要显式指定类型参数，应该能自动推断
        const scope = emitter.scope("x");

        type scopEvents = typeof scope.types.events;
        type xScopeEvents = ScopeEvents<Events, "x">;

        scope.on("users/x/online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, `users/x/online`>>,
                Expect<Equal<typeof message.payload, { name: string; status?: number }>>,
            ];
        });
        scope.on("users/x/y", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, `users/x/y`>>,
                Expect<Equal<typeof message.payload, 1>>,
            ];
        });

        scope.on("posts/fisher/online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, `posts/fisher/online`>>,
                Expect<Equal<typeof message.payload, string>>,
            ];
        });

        // 正确的类型检查
        scope.emit("users/fisher/online", { name: "string", status: 1 });
        scope.emit("users/fisher/online", { name: "string" });
        scope.emit("users/fisher/offline", true);
        scope.emit("posts/fisher/offline", 1);

        // 类型错误的调用，应该被TypeScript标记为错误
        // scope.emit('users/fisher/online', 1);
        // scope.emit('users/fisher/online', 2);
        // scope.emit('users/fisher/offline', 1);
        // scope.emit('posts/fisher/offline', '22');
    });
});
describe("事件作用域: 返回迭代器 类型测试", () => {
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
        const scope = emitter.scope("x/y/z");
        const aMessages = scope.on("a");
        type A1 = ValueOf<GetClosestEvents<Events, "a">>;
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], "a">>,
            Expect<Equal<AMessageType["payload"], 1>>,
            Expect<
                Equal<
                    AMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];

        const anyMessages = scope.onAny();
        type AnyMeta1 = typeof scope.types.meta;
        type AnyMessageType = IteratorMessage<typeof anyMessages>;
        type R1 = Extract<AnyMessageType, { type: "a" }>;
        type cases = [
            Expect<
                Equal<
                    Extract<AnyMessageType, { type: "a" }>,
                    {
                        type: "a";
                        payload: 1;
                        meta: FastEventMeta & FastEventScopeMeta & Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<AnyMessageType, { type: "b" }>,
                    {
                        type: "b";
                        payload: 2;
                        meta: FastEventMeta & FastEventScopeMeta & Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
        // 未定义类型的事件
        const xMessages = scope.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;

        type XCases = [
            Expect<Equal<XMessageType["type"], "xyz">>,
            Expect<Equal<XMessageType["payload"], any>>,
            Expect<
                Equal<
                    XMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
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

        const scope = emitter.scope("users");
        // 精确匹配

        const aMessages = scope.on("fisher/login");
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], `${string}/login`>>,
            Expect<Equal<AMessageType["payload"], string>>,
            Expect<
                Equal<
                    AMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];

        const loginMessages = scope.on("fisher/login");
        type LoginMessageType = IteratorMessage<typeof loginMessages>;
        type LoginCases = [
            Expect<Equal<LoginMessageType["type"], `${string}/login`>>,
            Expect<Equal<LoginMessageType["payload"], string>>,
            Expect<
                Equal<
                    LoginMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];
        // 未声明式的事件
        const XLoginMessages = scope.on("fisher/login/xxx");
        type XLoginMessageType = IteratorMessage<typeof XLoginMessages>;
        type XLoginCases = [
            Expect<Equal<XLoginMessageType["type"], "fisher/login/xxx">>,
            Expect<Equal<XLoginMessageType["payload"], any>>,
            Expect<
                Equal<
                    XLoginMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];
        const xMessages = scope.on("xyz");
        type XMessageType = IteratorMessage<typeof loginMessages>;
        type XCases = [
            Expect<Equal<XMessageType["type"], `${string}/login`>>,
            Expect<Equal<XMessageType["payload"], string>>,
            Expect<
                Equal<
                    XMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];
    });
    test("部份事件经过转换", () => {
        interface Events {
            "users/a": boolean;
            "users/b": NotPayload<number>;
            "users/c": NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();
        const scope = emitter.scope("users");
        const aMessages = scope.on("a");
        type AMessageType = IteratorMessage<typeof aMessages>;
        type ACases = [
            Expect<Equal<AMessageType["type"], `a`>>,
            Expect<Equal<AMessageType["payload"], boolean>>,
            Expect<
                Equal<
                    AMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];
        // b事件经过转换
        const bMessages = scope.on("b");
        type BMessageType = IteratorMessage<typeof bMessages>;
        type BCases = [Expect<Equal<BMessageType, number>>];

        // c事件经过转换
        const cMessages = scope.on("c");
        type CMessageType = IteratorMessage<typeof cMessages>;
        type CBCases = [Expect<Equal<CMessageType, { x: number; y: number }>>];
    });
    test("转换全部事件经过转换", () => {
        interface Events {
            "users/a": boolean;
            "users/b": NotPayload<number>;
            "users/c": NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();
        const scope = emitter.scope("users");
        const aMessages = scope.on("a");
        type AMessageType = IteratorMessage<typeof aMessages>;
        // b事件经过转换
        const bMessages = scope.on("b");
        type BMessageType = IteratorMessage<typeof bMessages>;
        // c事件经过转换
        const cMessages = scope.on("c");
        type CMessageType = IteratorMessage<typeof cMessages>;

        // 未定义类型的事件
        const xMessages = scope.on("xyz");
        type XMessageType = IteratorMessage<typeof xMessages>;
        type Cases = [
            Expect<Equal<AMessageType, boolean>>,
            Expect<Equal<BMessageType, number>>,
            Expect<Equal<CMessageType, { x: number; y: number }>>,
            // x未声明NotPayload
            Expect<Equal<XMessageType["type"], "xyz">>,
            Expect<Equal<XMessageType["payload"], any>>,
            Expect<
                Equal<
                    XMessageType["meta"],
                    FastEventMeta & FastEventScopeMeta & Record<string, any>
                >
            >,
        ];
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": NotPayload<number>;
        }
        const emitter = new FastEvent<Events>();

        const scope = emitter.scope("a/users");
        const messages = scope.on("c/2/d/3/e/4/g/5");
        type MessageType = IteratorMessage<typeof messages>;

        const anyMessages = scope.on("c/2/dd/3/ee");
        type AnyMessageType = IteratorMessage<typeof anyMessages>;

        type Cases = [
            Expect<Equal<AnyMessageType, number>>,
            // 没有使用NotPayload
            Expect<Equal<MessageType["type"], `c/${string}/d/${string}/e/${string}/g/${string}`>>,
            Expect<Equal<MessageType["payload"], string>>,
            Expect<
                Equal<MessageType["meta"], FastEventMeta & FastEventScopeMeta & Record<string, any>>
            >,
        ];
    });
});
describe("作用域上下文类型系统", () => {
    test("未指定上下文时应使用默认上下文类型", () => {
        const withoutCtxEmitter = new FastEvent();
        type Ctx1 = Expect<Equal<typeof withoutCtxEmitter.options.context, never>>;

        withoutCtxEmitter.on("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, FastEvent>>];
        });

        withoutCtxEmitter.once("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, FastEvent>>];
        });
    });

    test("指定上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        type Ctx = Expect<Equal<typeof emitter.context, { root: boolean }>>;

        emitter.on("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });

        emitter.once("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });
    });

    test("作用域继承上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        const withoutCtxScope = emitter.scope("x/y/z");
        type withoutScopeCtx = Expect<
            Equal<typeof withoutCtxScope.options.context, { root: boolean }>
        >;

        withoutCtxScope.on("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });

        withoutCtxScope.once("xxx", function (this, message) {
            type cases = [Expect<Equal<typeof this, { root: boolean }>>];
        });
    });

    test("作用域自定义上下文时的类型推导", () => {
        const emitter = new FastEvent({
            context: {
                root: true,
            },
        });
        const scope = emitter.scope("x/y/z", {
            context: 1,
        });
        type scopeEvents = typeof scope.types.events;

        type scopeCtx = Expect<Equal<typeof scope.options.context, number>>;

        scope.on("a", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, string>>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & Record<string, any> & FastEventScopeMeta
                    >
                >,
            ];
        });

        scope.once("a", function (this, message) {
            type cases = [
                Expect<Equal<typeof this, number>>,
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, any>>,
                Expect<
                    Equal<
                        typeof message.meta,
                        FastEventMeta & Record<string, any> & FastEventScopeMeta
                    >
                >,
            ];
        });
    });
    test("作用域指定事件类型", () => {
        const emitter = new FastEvent();
        const scope = emitter.scope<{
            a: boolean;
            b: number;
            c: string;
        }>("x/y/z");
        type ScopeEvents = typeof scope.types.events;
        type cases = [
            Expect<Equal<ScopeEvents["a"], boolean>>,
            Expect<Equal<ScopeEvents["b"], number>>,
            Expect<Equal<ScopeEvents["c"], string>>,
        ];
        scope.emit("a");
        scope.emitAsync("b", 1);
    });
    test("继承scope类", () => {
        type Events = {
            "rooms/*/users/online": { name: string; status?: number };
            "rooms/*/users/*/online": { name: string; status?: number };
            "rooms/*/users/*/offline": boolean;
            "rooms/*/posts/**": number;
            "rooms/*/posts/*/online": number;
        };
        const emitter = new FastEvent<Events>();

        class CustomScope extends FastEventScope {
            test() {}
        }
        type S = ScopeEvents<Events, "rooms/a">;

        function getRoomScope<Prefix extends string>(prefix: Prefix) {
            return emitter.scope(`rooms/${prefix}`, new CustomScope());
        }

        const scope = getRoomScope("y");
        scope.test;
        scope.on("users/online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "users/online">>,
                Expect<Equal<typeof message.payload, { name: string; status?: number }>>,
            ];
        });

        type scopEvents = keyof typeof scope.types.events;
    });
    test("继承scope类2", () => {
        interface VoerkaModuleEvents {
            initial: string;
            create: string;
            ready: string;
            start: string;
            stop: string;
            reset: string;
            observabled: string;
            stateUpdated: string;
            settingUpdated: string;
        }

        type dd = VoerkaModuleEvents & Record<string, any>;

        class ModuleBase<Events extends Record<string, any> = {}> extends FastEventScope<
            VoerkaModuleEvents & Events
        > {
            test(this: FastEventScope<VoerkaModuleEvents>) {
                type events = typeof this.types.events;
                this.on("initial", (message) => {
                    message.type;
                    message.payload;
                    type cases = [
                        Expect<Equal<typeof message.type, "initial">>,
                        Expect<Equal<typeof message.payload, string>>,
                    ];
                });
            }
        }

        class BModule extends ModuleBase<{ name: string }> {
            test2() {
                this.on("name", (message) => {
                    message.type;
                    message.payload;
                });
            }
        }

        const module = new ModuleBase();
        type d = typeof module.types.events;

        // module.on('create', (msg) => {
        //     msg.type;
        //     msg.payload;
        // });

        const b1 = new BModule();
        type bevents = keyof typeof b1.types.events;

        b1.test;
        b1.test2;
    });
    test("继承scope类32", () => {
        type Events = {
            "rooms/*/users/online": { name: string; status?: number };
            "rooms/*/users/*/online": { name: string; status?: number };
            "rooms/*/users/*/offline": boolean;
            "rooms/*/posts/**": number;
            "rooms/*/posts/*/online": number;
        };
        const emitter = new FastEvent<Events>();

        class CustomScope extends FastEventScope {
            join(name: string) {}
            leave() {}
        }
        type S = ScopeEvents<Events, "rooms/y">;

        function getRoom<Prefix extends string>(prefix: Prefix) {
            return emitter.scope(`rooms/${prefix}`, new CustomScope()); // as FastEventScopeExtend<Events, `rooms/${Prefix}`, CustomScope>;
        }

        const room = getRoom("y");
        type RoomEvents = typeof room.types.events;
        room.join("fisher");
        room.leave();
        room.on("posts/a", (message) => {
            message.type;
            message.payload;
        });
        room.on("users/online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "users/online">>,
                Expect<Equal<typeof message.payload, { name: string; status?: number }>>,
            ];
        });
    });

    test("继承scope类4", () => {
        type Events = {
            "rooms/*/users/online": { name: string; status?: number; root: boolean };
            "rooms/*/users/*/online": { name: string; status?: number };
            "rooms/*/users/*/offline": boolean;
            "rooms/*/posts/**": number;
            "rooms/*/posts/*/online": number;
        };

        const emitter = new FastEvent<Events>();

        class User extends FastEventScope {
            login(name: string) {}
            logout() {}
        }

        const useScope = emitter.scope(`rooms/x`);

        type uEevents = ScopeEvents<
            {
                "rooms/*/users/online": {
                    name: string;
                    status?: number;
                    root: boolean;
                };
                "rooms/*/users/*/online": {
                    name: string;
                    status?: number;
                };
                "rooms/*/users/*/offline": boolean;
                "rooms/*/posts/**": number;
                "rooms/*/posts/*/online": number;
            },
            "rooms/x"
        >;
        useScope.on("**", (message) => {
            type cases = [
                Expect<
                    Equal<
                        typeof message.type,
                        | `users/${string}/online`
                        | "users/online"
                        | `users/${string}/offline`
                        | `posts/${string}`
                        | (`posts/${string}` & `posts/${string}/online`)
                    >
                >,
            ];
        });

        const jack = useScope.scope("users/jack", new User());
        type jEevents = ScopeEvents<uEevents & Record<string, any>, "users/jack">;
        type jEeventNames = keyof jEevents;
        type jackEvents = typeof jack.types.events;
        jack.login("");
        jack.logout();
        jack.on("**");
        jack.on("online", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "online">>,
                Expect<Equal<typeof message.payload, { name: string; status?: number }>>,
            ];
        });

        jack.on("offline", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "offline">>,
                Expect<Equal<typeof message.payload, boolean>>,
            ];
        });
    });
    test("继承scope类5", () => {
        type Events = {
            "a1/b1/c1/d1/e1/f1": boolean;
            "a1/b1/c1/d1/e1/f2": boolean;
            "a1/b1/c1/d1/e1/f3": boolean;
            "a1/b1/c1/d1/e1/f4": boolean;
            "a1/b1/c1/d1/e2/f1": boolean;
            "a1/b1/c1/d1/e3/f1": boolean;
            "a1/b1/c1/d2/e1/f1": boolean;
            "a1/b1/c1/d3/e1/f1": boolean;
            "a1/b1/c2/d1/e1/f1": boolean;
            "a1/b1/c3/d1/e1/f1": boolean;
            "a1/b2/c1/d1/e1/f1": boolean;
            "a1/b2/c2/d1/e1/f1": boolean;
            "a1/b2/c3/d1/e1/f1": boolean;
            "a1/b3/c1/d1/e1/f1": boolean;
            "a1/b3/c2/d1/e1/f1": boolean;
            "a1/b3/c3/d1/e1/f1": boolean;
        };
        const emitter = new FastEvent<Events>();
        const a1 = emitter.scope("a1");
        a1.on("b1/c1/d1/e1/f2");
        type a1Kyes = keyof typeof a1.types.events;
        const b1 = a1.scope("b1");
        b1.on("c2/d1/e1/f1");
        type b1Kyes = keyof typeof b1.types.events;
        const c1 = b1.scope("c1");
        c1.on("");
        type c1Kyes = keyof typeof c1.types.events;
        const d1 = c1.scope("d1");
        d1.on("d1/e1/f1");
        type d1Kyes = keyof typeof d1.types.events;
        const e1 = d1.scope("e1");
        e1.on("d1/e1/f1");
        type e1Kyes = keyof typeof e1.types.events;
    });

    test("继承scope类6", () => {
        type Events = {
            "a1/b1/c1/d1/e1/f1": boolean;
            "a1/b1/c1/d1/e1/f2": boolean;
            "a1/b1/c1/d1/e1/f3": boolean;
            "a1/b1/c1/d1/e1/f4": boolean;
            "a1/b1/c1/d1/e2/f1": boolean;
            "a1/b1/c1/d1/e3/f1": boolean;
            "a1/b1/c1/d2/e1/f1": boolean;
            "a1/b1/c1/d3/e1/f1": boolean;
            "a1/b1/c2/d1/e1/f1": boolean;
            "a1/b1/c3/d1/e1/f1": boolean;
            "a1/b2/c1/d1/e1/f1": boolean;
            "a1/b2/c2/d1/e1/f1": boolean;
            "a1/b2/c3/d1/e1/f1": boolean;
            "a1/b3/c1/d1/e1/f1": boolean;
            "a1/b3/c2/d1/e1/f1": boolean;
            "a1/b3/c3/d1/e1/f1": boolean;
        };
        class User extends FastEventScope {
            login(name: string) {}
            logout() {}
        }

        const emitter = new FastEvent<Events>();
        const a1 = emitter.scope("a1", new User());
        type d = keyof Parameters<typeof a1.on>[1];
        a1.on("");
        type a1Kyes = keyof typeof a1.types.events;
        const b1 = a1.scope("b1", new User());
        b1.on("");
        b1.login("");
        b1.logout();
        type b1Kyes = keyof typeof b1.types.events;
        const c1 = b1.scope("c1", new User());
        c1.on("d1/e1/f2");
        type c1Kyes = keyof typeof c1.types.events;
        const d1 = c1.scope("d1", new User());
        d1.on("d1/e1/f1");
        d1.on("");
        type d1Kyes = keyof typeof d1.types.events;
        const e1 = d1.scope("e1", new User());
        e1.on("d1/e1/f1");
        type e1Kyes = keyof typeof e1.types.events;
    });
    // test("scope监听器类型", () => {
    //     type Events = {
    //         "rooms/*/users/online": { name: string; status?: number };
    //         "rooms/*/users/*/online": { name: string; status?: number };
    //         "rooms/*/users/*/offline": boolean;
    //         "rooms/*/posts/**": number;
    //         "rooms/*/posts/*/online": number;
    //     };
    //     const emitter = new FastEvent<Events>();
    //     const useScope = emitter.scope(`rooms/x`);

    //     type ScopeListeners = typeof useScope.types.listeners;

    //     // 'users/online': TypedFastEventListener<"users/online", {
    //     //         name: string;
    //     //         status?: number;
    //     //     }, FastEventMeta & FastEventScopeMeta & Record<string, any>, any>;
    //     //     'users/*/online': TypedFastEventListener<...>;
    //     //     'users/*/offline': TypedFastEventListener<...>;
    //     //     'posts/**': TypedFastEventListener<...>;
    //     //     'posts/*/online': TypedFastEventListener<...>;
    //     type ListenerKeys = keyof ScopeListeners;
    //     type cases = [
    //         Expect<
    //             Equal<
    //                 ScopeListeners["users/online"],
    //                 TypedFastEventListener<
    //                     "users/online",
    //                     { name: string; status?: number },
    //                     FastEventMeta & FastEventScopeMeta & Record<string, any>,
    //                     any
    //                 >
    //             >
    //         >,
    //         Expect<
    //             Equal<
    //                 ListenerKeys,
    //                 | "users/online"
    //                 | "users/*/online"
    //                 | "users/*/offline"
    //                 | "posts/**"
    //                 | "posts/*/online"
    //             >
    //         >,
    //     ];
    // });
});

describe("事件作用域含通配符的类型测试", () => {
    type CustomEvents = {
        "click/*": { x: number; y: number };
        "div/*/click": [number, number];
        "div/*/mousemove": boolean;
        "div/*/scroll": number;
        "div/focus": string;
    };
    const emitter = new FastEvent<CustomEvents>();
    test("scope事件类型测试", () => {
        const scope = emitter.scope("div");

        type scopeEvents = typeof scope.types.events;

        scope.on("x", (message) => {
            message.meta;
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
        scope.on("aaa/click", (message) => {
            message.meta;
            type cases = [
                Expect<Equal<typeof message.type, `${string}/click`>>,
                Expect<Equal<typeof message.payload, [number, number]>>,
            ];
        });
        scope.on("**", (message) => {
            // message.type = "sss/click";
            // message.payload = 1;
            type ff = ScopeEvents<
                {
                    "click/*": {
                        x: number;
                        y: number;
                    };
                    "div/*/click": [number, number];
                    "div/*/mousemove": boolean;
                    "div/*/scroll": number;
                    "div/focus": string;
                },
                "div"
            >;
            type cases = [
                Expect<
                    Equal<
                        typeof message.type,
                        "focus" | `${string}/click` | `${string}/mousemove` | `${string}/scroll`
                    >
                >,
                Expect<Equal<typeof message.payload, string | number | boolean | [number, number]>>,
            ];
        });
    });
});
