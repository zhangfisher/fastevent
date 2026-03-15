/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { NotPayload } from "../../types/transformed/NotPayload";
import { FastEventMessageExtends, GetClosestEvents, MutableMessage } from "../../types";
import { FastEventMeta } from "../../types/FastEventMessages";
import { FastEventIterator } from "../../utils/eventIterator";
type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

describe("使用onAny监听器的FaseEvent类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", () => {
        const emitter = new FastEvent();
        type ScopeEventType = GetClosestEvents<Record<string, any>, "x", Record<"x", any>>;
        emitter.onAny((message) => {
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
    });
    test("含通配符事件类型", () => {
        interface Events {
            a: boolean;
            b: number;
            c: "x" | "y" | "z";
            "div/*/click": { x: number; y: number };
            "users/*/login": string;
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();

        emitter.onAny((message) => {
            type cases = [
                Expect<
                    Equal<
                        typeof message.type,
                        | "a"
                        | "b"
                        | "c"
                        | `div/${string}/click`
                        | `users/${string}/login`
                        | `users/${string}/logout`
                        | `users/${string}/${string}`
                    >
                >,
                Expect<
                    Equal<
                        typeof message.payload,
                        | string
                        | number
                        | boolean
                        | {
                              x: number;
                              y: number;
                          }
                        | {
                              name: string;
                              vip: boolean;
                          }
                    >
                >,
            ];
        });
        emitter.onAny((message) => {
            type Keys = (typeof message)["type"];

            if (message.type === "a") {
                type cases = Expect<Equal<typeof message.payload, boolean>>;
            } else if (message.type === "b") {
                type cases = Expect<Equal<typeof message.payload, number>>;
            } else if (message.type === "c") {
                type cases = Expect<Equal<typeof message.payload, "x" | "y" | "z">>;
            } else if (message.type === "div/fisher/click") {
                type cases = Expect<Equal<typeof message.payload, { x: number; y: number }>>;
            } else if (message.type === "users/fisher/login") {
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        | string
                        | {
                              name: string;
                              vip: boolean;
                          }
                    >
                >;
            } else if (message.type === "users/fisher/logout") {
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        | number
                        | {
                              name: string;
                              vip: boolean;
                          }
                    >
                >;
            } else if (message.type === "users/x/y") {
                type cases = Expect<Equal<typeof message.payload, { name: string; vip: boolean }>>;
            }
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
        type Messages = MutableMessage<Events>;
        emitter.on("div/fisher/click", (message) => {
            type cases = Expect<Equal<typeof message.payload, { x: number; y: number }>>;
        });
        emitter.onAny((message) => {
            if (message.type === "a") {
                type cases = Expect<Equal<typeof message.payload, boolean | { data: any }>>;
            } else if (message.type === "b") {
                type cases = Expect<Equal<typeof message.payload, number | { data: any }>>;
            } else if (message.type === "c") {
                type cases = Expect<Equal<typeof message.payload, string | { data: any }>>;
            } else if (message.type === "div/fisher/click") {
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        { x: number; y: number } | { data: any } | Record<string, any>
                    >
                >;
            } else if (message.type === "users/fisher/login") {
                type P = typeof message.payload;
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        | string
                        | Record<string, any>
                        | {
                              name: string;
                              vip: boolean;
                          }
                        | {
                              data: any;
                          }
                    >
                >;
            } else if (message.type === "users/fisher/logout") {
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        | number
                        | Record<string, any>
                        | {
                              name: string;
                              vip: boolean;
                          }
                        | {
                              data: any;
                          }
                    >
                >;
            } else if (message.type === "users/x/y") {
                type cases = Expect<
                    Equal<
                        typeof message.payload,
                        | Record<string, any>
                        | {
                              name: string;
                              vip: boolean;
                          }
                        | {
                              data: any;
                          }
                    >
                >;
            }
        });
    });
    test("含多段通配符事件类型", () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        const subscriber = emitter.onAny((message) => {
            if (message.type === "a/1/c/1/d/1/e/1/g/1") {
                type cases = [Expect<Equal<typeof message.payload, string | number>>];
            } else if (message.type === "a/1/c/1/x/x/x/x/x/x") {
                type cases = [Expect<Equal<typeof message.payload, number>>];
            }
        });
    });
    test("部份事件经过转换", () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<Events>();

        type Messages = MutableMessage<Events>;

        emitter.onAny((message) => {
            if (typeof message === "number") {
                type cases = [Expect<Equal<typeof message, number>>];
            } else if (typeof message === "object") {
                if ("type" in message) {
                    type cases = [
                        Expect<
                            Equal<
                                typeof message,
                                {
                                    type: "a";
                                    payload: boolean;
                                    meta?: (FastEventMeta & Record<string, any>) | undefined;
                                } & FastEventMessageExtends
                            >
                        >,
                    ];
                } else {
                    type cases = Expect<Equal<typeof message, { x: number; y: number }>>;
                }
            }
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

        emitter.once("a", (message) => {
            type cases = [Expect<Equal<typeof message, boolean>>];
        });
        // b事件经过转换
        emitter.once("b", (message) => {
            type cases = [Expect<Equal<typeof message, number>>];
        });
        // c事件经过转换
        emitter.once("c", (message) => {
            type MessageType = typeof message;
            type cases = [Expect<Equal<MessageType, { x: number; y: number }>>];
        });
        // 未定义类型的事件
        emitter.once("x", (message) => {
            type cases = [
                Expect<Equal<typeof message.type, "x">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
});
describe("使用onAny返回迭代器类型系统测试", () => {
    test("没有指定事件类型时支持所有事件", async () => {
        const emitter = new FastEvent();
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        type cases = [
            Expect<Equal<MessageType["type"], string>>,
            Expect<Equal<MessageType["payload"], any>>,
            Expect<Equal<MessageType["meta"], Record<string, any> & FastEventMeta>>,
        ];
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
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (message.type === "a") {
                type cases = [
                    Expect<Equal<typeof message.type, "a">>,
                    Expect<Equal<typeof message.payload, boolean>>,
                ];
            } else if (message.type === "b") {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                ];
            } else if (message.type === "c") {
                type cases = [
                    Expect<Equal<typeof message.type, "c">>,
                    Expect<Equal<typeof message.payload, string>>,
                ];
            } else if (message.type === "x/y/z/a") {
                type cases = [
                    Expect<Equal<typeof message.type, "x/y/z/a">>,
                    Expect<Equal<typeof message.payload, 1>>,
                ];
            } else if (message.type === "x/y/z/b") {
                type cases = [
                    Expect<Equal<typeof message.type, "x/y/z/b">>,
                    Expect<Equal<typeof message.payload, 2>>,
                ];
            } else if (message.type === "x/y/z/c") {
                type cases = [
                    Expect<Equal<typeof message.type, "x/y/z/c">>,
                    Expect<Equal<typeof message.payload, 3>>,
                ];
            }
        }
    });
    test("含通配符事件类型", async () => {
        interface Events {
            a: boolean;
            b: number;
            c: "x" | "y" | "z";
            "div/*/click": { x: number; y: number };
            "users/*/login": string;
            "users/*/logout": number;
            "users/*/*": { name: string; vip: boolean };
        }
        const emitter = new FastEvent<Events>();
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (message.type === "a") {
                type cases = [
                    Expect<Equal<typeof message.type, "a">>,
                    Expect<Equal<typeof message.payload, boolean>>,
                ];
            } else if (message.type === "b") {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<Equal<typeof message.payload, number>>,
                ];
            } else if (message.type === "c") {
                type cases = [
                    Expect<Equal<typeof message.type, "c">>,
                    Expect<Equal<typeof message.payload, "x" | "y" | "z">>,
                ];
            } else if (message.type === "div/buy/click") {
                type cases = [
                    Expect<Equal<typeof message.type, "div/buy/click">>,
                    Expect<Equal<typeof message.payload, { x: number; y: number }>>,
                ];
            } else if (message.type === "users/fisher/login") {
                type cases = [
                    Expect<Equal<typeof message.type, "users/fisher/login">>,
                    Expect<Equal<typeof message.payload, string | { name: string; vip: boolean }>>,
                ];
            } else if (message.type === "users/fisher/logout") {
                type cases = [
                    Expect<Equal<typeof message.type, "users/fisher/logout">>,
                    Expect<Equal<typeof message.payload, number | { name: string; vip: boolean }>>,
                ];
            }
        }
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
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (message.type === "a") {
                type cases = [
                    Expect<Equal<typeof message.type, "a">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | boolean
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            } else if (message.type === "b") {
                type cases = [
                    Expect<Equal<typeof message.type, "b">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | number
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            } else if (message.type === "c") {
                type cases = [
                    Expect<Equal<typeof message.type, "c">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | string
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            } else if (message.type === "div/buy/click") {
                type cases = [
                    Expect<Equal<typeof message.type, "div/buy/click">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | Record<string, any>
                            | {
                                  x: number;
                                  y: number;
                              }
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            } else if (message.type === "users/fisher/login") {
                type cases = [
                    Expect<Equal<typeof message.type, "users/fisher/login">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | string
                            | Record<string, any>
                            | {
                                  name: string;
                                  vip: boolean;
                              }
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            } else if (message.type === "users/fisher/logout") {
                type cases = [
                    Expect<Equal<typeof message.type, "users/fisher/logout">>,
                    Expect<
                        Equal<
                            typeof message.payload,
                            | number
                            | Record<string, any>
                            | {
                                  name: string;
                                  vip: boolean;
                              }
                            | {
                                  data: any;
                              }
                        >
                    >,
                ];
            }
        }
    });
    test("含多段通配符事件类型", async () => {
        interface Events {
            "a/*/c/*/d/*/e/*/g/*": string;
            "a/*/c/**": number;
        }
        const emitter = new FastEvent<Events>();
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (message.type === "a/1/c/1/d/1/e/1/g/1") {
                type cases = [
                    Expect<Equal<typeof message.type, "a/1/c/1/d/1/e/1/g/1">>,
                    Expect<Equal<typeof message.payload, string | number>>,
                ];
            } else if (message.type === "a/1/c/x/y/z") {
                type cases = [
                    Expect<Equal<typeof message.type, "a/1/c/x/y/z">>,
                    Expect<Equal<typeof message.payload, number>>,
                ];
            }
        }
    });
    test("部份事件经过转换", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<string>;
        }
        const emitter = new FastEvent<Events>();

        type Messages = MutableMessage<Events>;
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (typeof message === "object" && "type" in message) {
                type cases = [
                    Expect<Equal<typeof message.type, "a">>,
                    Expect<Equal<typeof message.payload, boolean>>,
                ];
            } else {
                if (typeof message === "number") {
                    type cases = [Expect<Equal<typeof message, number>>];
                } else {
                    type cases = [Expect<Equal<typeof message, string>>];
                }
            }
        }
    });
    test("转换全部事件经过转换", async () => {
        interface Events {
            a: boolean;
            b: NotPayload<number>;
            c: NotPayload<{ x: number; y: number }>;
        }
        const emitter = new FastEvent<TransformedEvents<Events>>();
        const messages = emitter.onAny();
        type MessageType = IteratorMessage<typeof messages>;
        for await (const message of messages) {
            if (typeof message === "number") {
                type cases = [Expect<Equal<typeof message, number>>];
            } else if (typeof message === "boolean") {
                type cases = [Expect<Equal<typeof message, boolean>>];
            } else {
                type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
            }
        }
    });
});
