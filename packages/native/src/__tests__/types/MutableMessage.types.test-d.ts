/* eslint-disable no-unused-vars */

import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { MutableMessage } from "../../types/MutableMessage";
import { FastEventMessageExtends, IsMatchEventName, KeyOf } from "../../types";
import { UnionToTuple } from "type-fest";

type PickByType<E, T extends string> = E extends {
    type: infer Type;
    payload: infer P;
    meta?: infer M;
}
    ? IsMatchEventName<T, Type> extends true
        ? {
              type: T;
              payload: P;
              meta?: M;
          }
        : never
    : never;

describe("MutableMessage - 基本事件类型测试", () => {
    test("简单事件类型2", () => {
        type Events = {
            a: boolean;
            b: number;
            c: string;
        };

        type Message = MutableMessage<Events>;
        type M1 = Extract<Message, { type: "a" }>;

        type cases = [
            // 每个事件都应该生成对应的消息类型
            Expect<
                Equal<
                    Extract<Message, { type: "a" }>,
                    {
                        type: "a";
                        payload: boolean;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "b" }>,
                    {
                        type: "b";
                        payload: number;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "c" }>,
                    {
                        type: "c";
                        payload: string;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });
    test("简单事件类型", () => {
        type Events = {
            a: boolean;
            b: number;
            c: string;
        };

        type Message = MutableMessage<Events>;

        type cases = [
            // 每个事件都应该生成对应的消息类型
            Expect<
                Equal<
                    Extract<Message, { type: "a" }>,
                    {
                        type: "a";
                        payload: boolean;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "b" }>,
                    {
                        type: "b";
                        payload: number;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "c" }>,
                    {
                        type: "c";
                        payload: string;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("对象类型 payload", () => {
        type Events = {
            userCreated: { id: number; name: string };
            userDeleted: { id: number; reason?: string };
            userUpdated: { id: number; changes: Record<string, any> };
        };

        type Message = MutableMessage<Events>;
        type E1 = Extract<Message, { type: "userCreated" }>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "userCreated" }>,
                    {
                        type: "userCreated";
                        payload: { id: number; name: string };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "userDeleted" }>,
                    {
                        type: "userDeleted";
                        payload: { id: number; reason?: string };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "userUpdated" }>,
                    {
                        type: "userUpdated";
                        payload: { id: number; changes: Record<string, any> };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("联合类型 payload", () => {
        type Events = {
            statusChanged: "active" | "inactive" | "pending";
            notificationSent: string | number;
            complexEvent: boolean | { data: string } | null;
        };

        type Message = MutableMessage<Events>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "statusChanged" }>,
                    {
                        type: "statusChanged";
                        payload: "active" | "inactive" | "pending";
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "notificationSent" }>,
                    {
                        type: "notificationSent";
                        payload: string | number;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "complexEvent" }>,
                    {
                        type: "complexEvent";
                        payload: boolean | { data: string } | null;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("数组类型 payload", () => {
        type Events = {
            itemsAdded: number[];
            itemsRemoved: string[];
            batchOperation: [string, number, boolean][];
        };

        type Message = MutableMessage<Events>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "itemsAdded" }>,
                    {
                        type: "itemsAdded";
                        payload: number[];
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "itemsRemoved" }>,
                    {
                        type: "itemsRemoved";
                        payload: string[];
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "batchOperation" }>,
                    {
                        type: "batchOperation";
                        payload: [string, number, boolean][];
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });
});

describe("MutableMessage - 通配符事件类型测试", () => {
    test("单级通配符 * 事件", () => {
        type Events = {
            "users/*/login": { userId: number; timestamp: number };
            "users/*/logout": { userId: number };
            "div/*/click": { x: number; y: number };
        };

        type Message = MutableMessage<Events>;

        type M1 = PickByType<Message, "users/*/login">;
        type M2 = PickByType<Message, "users/asss/login">;
        type M3 = PickByType<Message, `users/${string}/login`>;

        type cases = [
            // 通配符 * 应该被展开为模板字符串类型
            Expect<
                Equal<
                    PickByType<Message, `users/${string}/login`>,
                    {
                        type: `users/${string}/login`;
                        payload: { userId: number; timestamp: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
            Expect<
                Equal<
                    PickByType<Message, `users/${string}/logout`>,
                    {
                        type: `users/${string}/logout`;
                        payload: { userId: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
            Expect<
                Equal<
                    PickByType<Message, `div/${string}/click`>,
                    {
                        type: `div/${string}/click`;
                        payload: { x: number; y: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
        ];
    });

    test("多级通配符 ** 事件", () => {
        type Events = {
            "user/**": { action: string; data: any };
            "admin/dashboard/**": { adminId: number };
            // ** 只能用于未尾
            "api/**/response": { status: number; body: any };
        };

        type Message = MutableMessage<Events>;
        type cases = [
            Expect<
                Equal<
                    PickByType<Message, `user/${string}`>,
                    {
                        type: `user/${string}`;
                        payload: { action: string; data: any };
                        meta?: Record<string, any>;
                    }
                >
            >,
            Expect<
                Equal<
                    PickByType<Message, `admin/dashboard/${string}`>,
                    {
                        type: `admin/dashboard/${string}`;
                        payload: { adminId: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: `api/**/response` }>,
                    {
                        type: `api/**/response`;
                        payload: { status: number; body: any };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("混合通配符事件", () => {
        type Events = {
            "users/*/login": { userId: number };
            "users/*/logout": { userId: number };
            "users/*/*": { name: string; action: string };
            "**": Record<string, any>;
            "*": { catchAll: true };
        };
        type Keys = keyof Events;

        type Message = MutableMessage<Events>;
        type Count = UnionToTuple<Message>["length"];
        type E1 = Extract<Message, { type: `users/${string}/${string}` }>["type"];
        type E2 = PickByType<Message, `users/${string}/login`>;
        const M1: Message = {
            type: "users/a/a",
            payload: { name: 1, action: "" },
        };
    });
});

describe("MutableMessage - Meta 参数测试", () => {
    test("自定义 Meta 类型", () => {
        type Events = {
            eventA: string;
            eventB: number;
        };

        type CustomMeta = {
            userId: number;
            timestamp: number;
            requestId: string;
        };

        type Message = MutableMessage<Events, CustomMeta>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "eventA" }>,
                    {
                        type: "eventA";
                        payload: string;
                        meta?: CustomMeta;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "eventB" }>,
                    {
                        type: "eventB";
                        payload: number;
                        meta?: CustomMeta;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("复杂 Meta 类型", () => {
        type Events = {
            apiCall: { endpoint: string };
            dbQuery: { query: string };
        };

        type ComplexMeta = {
            user: {
                id: number;
                roles: string[];
            };
            context: {
                ip: string;
                userAgent: string;
            };
            metadata: Record<string, any>;
        };

        type Message = MutableMessage<Events, ComplexMeta>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "apiCall" }>,
                    {
                        type: "apiCall";
                        payload: { endpoint: string };
                        meta?: ComplexMeta;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "dbQuery" }>,
                    {
                        type: "dbQuery";
                        payload: { query: string };
                        meta?: ComplexMeta;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("默认 Meta 类型为 Record<string, any>", () => {
        type Events = {
            eventX: boolean;
        };

        type Message = MutableMessage<Events>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "eventX" }>,
                    {
                        type: "eventX";
                        payload: boolean;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });
});

describe("MutableMessage - 边界情况测试", () => {
    test("空事件对象", () => {
        type Events = Record<string, any>;

        type Message = MutableMessage<Events>;

        // 空事件应该返回 never
        type cases = [
            Expect<
                Equal<
                    Omit<Message, "meta">,
                    {
                        type: string;
                        payload: any;
                    }
                >
            >,
        ];
    });

    test("嵌套路径事件", () => {
        type Events = {
            "a/b/c/d": { deep: number };
            "x/y/z": { nested: string };
            "level1/level2/level3/level4/level5": { very: { deep: { path: boolean } } };
        };

        type Message = MutableMessage<Events>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "a/b/c/d" }>,
                    {
                        type: "a/b/c/d";
                        payload: { deep: number };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "x/y/z" }>,
                    {
                        type: "x/y/z";
                        payload: { nested: string };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "level1/level2/level3/level4/level5" }>,
                    {
                        type: "level1/level2/level3/level4/level5";
                        payload: { very: { deep: { path: boolean } } };
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("函数类型 payload", () => {
        type Events = {
            callback: (data: string) => void;
            handler: (event: MouseEvent) => boolean;
        };

        type Message = MutableMessage<Events>;

        type cases = [
            Expect<
                Equal<
                    Extract<Message, { type: "callback" }>,
                    {
                        type: "callback";
                        payload: (data: string) => void;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "handler" }>,
                    {
                        type: "handler";
                        payload: (event: MouseEvent) => boolean;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });

    test("字面量类型事件名", () => {
        type Events = {
            123: number; // 数字键 不支持数字
            "test-event": string; // 带连字符
            Test_Event: boolean; // 带下划线
        };

        type Message = MutableMessage<Events>;
        type Keys = KeyOf<Events>;
        type X123 = Extract<Message, { type: 123 }>;
        type cases = [
            Expect<Equal<Extract<Message, { type: 123 }>, never>>,
            Expect<
                Equal<
                    Extract<Message, { type: "test-event" }>,
                    {
                        type: "test-event";
                        payload: string;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<Message, { type: "Test_Event" }>,
                    {
                        type: "Test_Event";
                        payload: boolean;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });
});

describe("MutableMessage - 与 ToMessage 的对比测试", () => {
    test("MutableMessage 使用 GetPayload，ToMessage 直接使用 Events[K]", () => {
        type Events = {
            "users/*/login": { userId: number };
            simpleEvent: string;
        };

        type MutableMsg = MutableMessage<Events>;

        type cases = [
            // ToMessage 直接使用 Events[K]
            Expect<
                Equal<
                    Extract<MutableMsg, { type: "simpleEvent" }>,
                    {
                        type: "simpleEvent";
                        payload: string;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
            // MutableMessage 使用 GetPayload
            Expect<
                Equal<
                    Extract<MutableMsg, { type: "simpleEvent" }>,
                    {
                        type: "simpleEvent";
                        payload: string;
                        meta?: Record<string, any>;
                    } & FastEventMessageExtends
                >
            >,
        ];
    });
});

describe("MutableMessage - 实际使用场景测试", () => {
    test("FastEvent emit 方法的消息类型", () => {
        type Events = {
            userCreated: { id: number; name: string };
            userUpdated: { id: number; changes: Partial<{ name: string; email: string }> };
            userDeleted: { id: number; reason?: string };
            "users/*/login": { userId: number; ip: string };
            "users/*/logout": { userId: number };
        };

        type AppMeta = {
            userId: number;
            timestamp: number;
            requestId: string;
        };

        type EmitMessage = MutableMessage<Events, AppMeta>;

        // 纯类型测试：验证消息类型的结构
        type cases = [
            // 精确事件类型
            Expect<
                Equal<
                    Extract<EmitMessage, { type: "userCreated" }>,
                    {
                        type: "userCreated";
                        payload: { id: number; name: string };
                        meta?: AppMeta;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<EmitMessage, { type: "userUpdated" }>,
                    {
                        type: "userUpdated";
                        payload: { id: number; changes: Partial<{ name: string; email: string }> };
                        meta?: AppMeta;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    Extract<EmitMessage, { type: "userDeleted" }>,
                    {
                        type: "userDeleted";
                        payload: { id: number; reason?: string };
                        meta?: AppMeta;
                    } & FastEventMessageExtends
                >
            >,
            // 通配符事件类型
            Expect<
                Equal<
                    PickByType<EmitMessage, `users/${string}/login`>,
                    {
                        type: `users/${string}/login`;
                        payload: { userId: number; ip: string };
                        meta?: AppMeta;
                    }
                >
            >,
            Expect<
                Equal<
                    PickByType<EmitMessage, `users/${string}/logout`>,
                    {
                        type: `users/${string}/logout`;
                        payload: { userId: number };
                        meta?: AppMeta;
                    }
                >
            >,
        ];
    });

    test("错误处理场景", () => {
        type Events = {
            errorOccurred: { code: number; message: string };
            warningRaised: { level: "low" | "medium" | "high"; message: string };
            "errors/*/critical": { errorId: string; details: any };
        };

        type ErrorMeta = {
            stackTrace?: string;
            context?: Record<string, any>;
        };

        type ErrorMessage = MutableMessage<Events, ErrorMeta>;
        type R = Extract<ErrorMessage, { type: "errorOccurred" }>;
        type cases = [
            Expect<
                Equal<
                    Extract<ErrorMessage, { type: "errorOccurred" }>,
                    {
                        type: "errorOccurred";
                        payload: { code: number; message: string };
                        meta?: ErrorMeta;
                    } & FastEventMessageExtends
                >
            >,
            Expect<
                Equal<
                    PickByType<ErrorMessage, `errors/${string}/critical`>,
                    {
                        type: `errors/${string}/critical`;
                        payload: { errorId: string; details: any };
                        meta?: ErrorMeta;
                    }
                >
            >,
        ];
    });
    test("sdddd", () => {
        interface Events {
            a: boolean;
            b: number;
            c: string;
            "x/y/z/a": 1;
            "x/y/z/b": 2;
            "x/y/z/c": 3;
        }
        type Message = MutableMessage<Events, { a: 1 }>;
        type Ks = Message["type"];

        function test<T extends keyof Events>(type: T, directive: symbol): [];
        function test<R = any>(message: Message): R[];
        function test<R = any>(message: { type: Message["type"] }): R[];
        // function test<R = any, T extends keyof Events = keyof Events>(
        //     type: T,
        //     payload?: boolean,
        //     retain?: boolean,
        // ): R[];
        // function test<R = any, T extends string = string>(
        //     type: T,
        //     payload?: 1,
        //     retain?: boolean,
        // ): R[];
        function test(): any {}

        test({
            type: "x/y/z/a",
        });
    });
});
