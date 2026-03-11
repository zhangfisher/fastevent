// oxlint-disable no-unused-expressions
/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { GetClosestEvents } from "../../types";
import { TypedFastEventMessage } from "../../types/FastEventMessages";
import { TransformedEvents } from "../../types/transformed/TransformedEvents";
import { PickTransformedEvents } from "../../types/transformed/PickTransformedEvents";
import { AssertFastMessage as NotPayload } from "../../types/FastEventMessages";
import { ValueOf } from "../../types/utils/ValueOf";

describe("启用Transform时的类型支持", () => {
    test("自定义事件转换", () => {
        type CustomEvents = {
            click: NotPayload<{ x: number; y: number }>;
            mousemove: boolean;
            scroll: number;
            focus: string;
        };

        const emitter = new FastEvent<CustomEvents>({
            transform: (message) => {
                return message.payload;
            },
        });

        emitter.on("click", (message) => {
            message.x;
            message.y;
            type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
        });
        emitter.on("mousemove", (message) => {
            message.payload;
            type cases = [Expect<Equal<typeof message.payload, boolean>>];
        });

        emitter.on("xxx", (message) => {
            message.payload;
            type cases = [
                Expect<Equal<typeof message.type, "xxx">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
    test("含通配符的自定义事件转换", () => {
        type CustomEvents = {
            "click/*": NotPayload<{ x: number; y: number }>;
            "*/mousemove": boolean;
            scroll: number;
            focus: string;
        };

        type d = PickTransformedEvents<CustomEvents>;

        const emitter = new FastEvent<CustomEvents>({
            transform: (message) => {
                return message.payload;
            },
        });

        emitter.on("click/div", (message) => {
            message.x;
            message.y;
            type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
        });
        emitter.once("a/mousemove", (message) => {
            message.payload;
            type cases = [Expect<Equal<typeof message.payload, boolean>>];
        });
        emitter.once("click/div", (message) => {
            message.x;
            message.y;
            type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
        });
        emitter.on("a/mousemove", (message) => {
            message.payload;
            type cases = [Expect<Equal<typeof message.payload, boolean>>];
        });
        emitter.on("xxx", (message) => {
            message.payload;
            type cases = [
                Expect<Equal<typeof message.type, "xxx">>,
                Expect<Equal<typeof message.payload, any>>,
            ];
        });
    });
    test("Event自定义事件转换", () => {
        type CustomEvents = {
            "div/click": NotPayload<{ x: number; y: number }>;
            "div/mousemove": boolean;
            "div/mouseout": NotPayload<boolean>;
            "div/scroll": number;
            "div/focus": string;
        };

        const emitter = new FastEvent<CustomEvents>({
            transform: (message) => {
                if (["div/click", "div/mousemove"].includes(message.type)) {
                    return message.payload;
                }
                return message;
            },
        });
        return new Promise<void>((resolve) => {
            emitter.on("div/click", (message) => {
                expect(message.x).toBe(1);
                expect(message.y).toBe(2);
                type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
            });
            emitter.emit("div/click", { x: 1, y: 2 });
            // scope.emit('click', { x: '1', y: 2 });
            emitter.on("div/mousemove", (message) => {
                expect(message).toBe(true);

                type cases = [Expect<Equal<typeof message.payload, boolean>>];
                resolve();
            });
            emitter.on("div/mouseout", (message) => {
                type cases = [Expect<Equal<typeof message, boolean>>];
                resolve();
            });
            emitter.emit("div/mousemove", true);
            emitter.on("xxx", (message) => {
                message.payload;
                type cases = [
                    Expect<Equal<typeof message.type, "xxx">>,
                    Expect<Equal<typeof message.payload, any>>,
                ];
            });
        });
    });
    test("Scope自定义事件转换", () => {
        type CustomEvents = {
            "div/click": NotPayload<{ x: number; y: number }>;
            "div/mousemove": boolean;
            "div/mouseout": NotPayload<boolean>;
            "div/scroll": number;
            "div/focus": string;
        };

        const emitter = new FastEvent<CustomEvents>({
            transform: (message) => {
                if (["div/click", "div/mousemove"].includes(message.type)) {
                    return message.payload;
                }
                return message;
            },
        });
        return new Promise<void>((resolve) => {
            const scope = emitter.scope("div");
            type f = TypedFastEventMessage<
                Record<
                    "click",
                    NotPayload<{
                        x: number;
                        y: number;
                    }>
                >
            >;
            scope.on("click", (message) => {
                expect(message.x).toBe(1);
                expect(message.y).toBe(2);
                type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
            });
            scope.emit("click", { x: 1, y: 2 });
            // scope.emit('click', { x: '1', y: 2 });
            scope.on("mousemove", (message) => {
                expect(message).toBe(true);
                type cases = [Expect<Equal<typeof message.payload, boolean>>];
                resolve();
            });
            scope.on("mouseout", (message) => {
                expect(message).toBe(true);
                type cases = [Expect<Equal<typeof message, boolean>>];
                resolve();
            });
            scope.emit("mousemove", true);
            scope.on("xxx", (message) => {
                message.payload;
                type cases = [
                    Expect<Equal<typeof message.type, "xxx">>,
                    Expect<Equal<typeof message.payload, any>>,
                ];
            });
        });
    });
    test("Scope含通配符的自定义事件转换", () => {
        type CustomEvents = {
            "div/click": NotPayload<{ x: number; y: number }>;
            "div/*/mousemove": NotPayload<boolean>;
            "div/scroll": number;
            "div/focus": string;
        };

        const emitter = new FastEvent<CustomEvents>({
            transform: (message) => {
                if (["div/click", "div/mousemove"].includes(message.type)) {
                    return message.payload;
                }
                return message;
            },
        });
        return new Promise<void>((resolve) => {
            const scope = emitter.scope("div");

            scope.on("click", (message) => {
                expect(message.x).toBe(1);
                expect(message.y).toBe(2);
                type cases = [Expect<Equal<typeof message, { x: number; y: number }>>];
            });
            scope.emit("click", { x: 1, y: 2 });
            // scope.emit('click', { x: '1', y: 2 });
            scope.on("a/mousemove", (message) => {
                expect(message).toBe(true);
                type cases = [Expect<Equal<typeof message, boolean>>];
            });
            scope.once("a/mousemove", (message) => {
                expect(message).toBe(true);
                type cases = [Expect<Equal<typeof message, boolean>>];
            });
            scope.emit("mousemove", true);
            scope.on("xxx", (message) => {
                type cases = [
                    Expect<Equal<typeof message.type, "xxx">>,
                    Expect<Equal<typeof message.payload, any>>,
                ];
            });
            resolve();
        });
    });
    test("所有Scope自定义事件转换", () => {
        type WebEvents = TransformedEvents<{
            "rooms/*/$join": { room: string; welcome: string; users: string[] };
            "rooms/*/$leave": string;
            "rooms/*/$error": string;
            "rooms/*/$add": string;
            "rooms/*/$remove": string;
            "rooms/*/*": number;
        }>;
        const emitter = new FastEvent<WebEvents>();
        emitter.on("rooms/xssss/$join", (message) => {
            type cases = [
                Expect<Equal<typeof message.room, string>>,
                Expect<Equal<typeof message.welcome, string>>,
                Expect<Equal<typeof message.users, string[]>>,
            ];
        });
        emitter.once("rooms/xssss/$join", (message) => {
            type cases = [
                Expect<Equal<typeof message.room, string>>,
                Expect<Equal<typeof message.welcome, string>>,
                Expect<Equal<typeof message.users, string[]>>,
            ];
        });
        // emitter.onAny((message) => {
        //     type cases = [Expect<Equal<typeof message.room, string>>, Expect<Equal<typeof message.welcome, string>>, Expect<Equal<typeof message.users, string[]>>];
        // });
        const scope = emitter.scope("rooms/test");
        type ScopeEvents = typeof scope.types.events;
        type JoinEvents = ScopeEvents["$join"]["type"];
        type SJoinEventss = GetClosestEvents<ScopeEvents, "$join">;
        type JoinEventss = ValueOf<GetClosestEvents<ScopeEvents, "$join">>;

        scope.on("$join", (message) => {
            message.room;
            message.welcome;
            message.users;
            type cases = [
                Expect<Equal<typeof message.room, string>>,
                Expect<Equal<typeof message.welcome, string>>,
                Expect<Equal<typeof message.users, string[]>>,
            ];
        });
    });
});
