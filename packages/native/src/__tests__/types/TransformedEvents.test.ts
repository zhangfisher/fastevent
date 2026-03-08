/* eslint-disable no-unused-vars */
/**
 * 将整个事件全部转换为NotPayload
 */

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import {
    type TransformedEvents,
    ExpandWildcard,
    ExtendWildcardEvents,
    GetMatchedEventPayload,
    NotPayload,
    GetMatchedEvents,
} from "../../types";

describe("TransformedEvents", () => {
    test("非通配符事件正确转换为 FastMessagePayload", () => {
        type Events = {
            click: { x: number; y: number };
            mousemove: boolean;
            "user/login": string;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["click"], NotPayload<{ x: number; y: number }>>>,
            Expect<Equal<Result["mousemove"], NotPayload<boolean>>>,
            Expect<Equal<Result["user/login"], NotPayload<string>>>,
        ];
    });

    test("单级通配符 * 转换", () => {
        type Events = {
            "user/*": string;
            "api/v1/*": number;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["user/login"], NotPayload<string>>>,
            Expect<Equal<Result["user/logout"], NotPayload<string>>>,
            Expect<Equal<Result["user/profile"], NotPayload<string>>>,
            Expect<Equal<Result["api/v1/users"], NotPayload<number>>>,
            Expect<Equal<Result["api/v1/posts"], NotPayload<number>>>,
        ];
    });

    test("多级通配符 ** 转换", () => {
        type Events = {
            "data/**": boolean;
            "user/profile/**": { id: number };
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result[`data/${string}`], NotPayload<boolean>>>,
            Expect<Equal<Result["data/users"], NotPayload<boolean>>>,
            Expect<Equal<Result["data/users/posts"], NotPayload<boolean>>>,
            Expect<Equal<Result["data/a/b/c/d"], NotPayload<boolean>>>,
            Expect<Equal<Result[`user/profile/${string}`], NotPayload<{ id: number }>>>,
            Expect<Equal<Result["user/profile/settings"], NotPayload<{ id: number }>>>,
            Expect<Equal<Result["user/profile/a/b/c"], NotPayload<{ id: number }>>>,
        ];
    });

    test("混合通配符转换", () => {
        type Events = {
            "div/click/*": { x: number; y: number };
            "x/*/y/*": number;
            "simple*test": string;
            "no/wildcard": string[];
            "*/*/*/*": 1;
            "*": 2;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            // 单级通配符扩展
            Expect<Equal<Result["div/click/button"], NotPayload<{ x: number; y: number }>>>,
            Expect<Equal<Result["div/click/anything"], NotPayload<{ x: number; y: number }>>>,
            // 多个单级通配符
            Expect<Equal<Result[`x/${string}/y/${string}`], NotPayload<number> & NotPayload<1>>>,
            Expect<Equal<Result[`x/123/y/456`], NotPayload<number> & NotPayload<1>>>,
            // 中间通配符
            Expect<Equal<Result["simpleWildcardtest"], NotPayload<2>>>,
            Expect<Equal<Result["simpleXYZtest"], NotPayload<2>>>,
            // 非通配符保持不变
            Expect<Equal<Result["no/wildcard"], NotPayload<string[]>>>,
            // 全局通配符
            Expect<Equal<Result["a/b/c/d"], NotPayload<1>>>,
            Expect<Equal<Result["anything"], NotPayload<2>>>,
        ];
    });

    test("优先级：精确键覆盖通配符扩展", () => {
        type Events = {
            "user/*": string;
            "user/login": { userId: number };
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            // 精确键优先
            Expect<Equal<Result["user/login"], NotPayload<{ userId: number }>>>,
            // 通配符扩展的其他键
            Expect<Equal<Result["user/logout"], NotPayload<string>>>,
            Expect<Equal<Result["user/profile"], NotPayload<string>>>,
        ];
    });

    test("通配符在开头", () => {
        type Events = {
            "*/click": { target: string };
            "*/user/profile": { name: string };
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["div/click"], NotPayload<{ target: string }>>>,
            Expect<Equal<Result["button/click"], NotPayload<{ target: string }>>>,
            Expect<Equal<Result["admin/user/profile"], NotPayload<{ name: string }>>>,
            Expect<Equal<Result["guest/user/profile"], NotPayload<{ name: string }>>>,
        ];
    });

    test("通配符在中间", () => {
        type Events = {
            "api/*/users": number[];
            "data/v*/detail": boolean;
            "data/*/detail": boolean;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["api/v1/users"], NotPayload<number[]>>>,
            Expect<Equal<Result["api/v2/users"], NotPayload<number[]>>>,
            Expect<Equal<Result["data/v*/detail"], NotPayload<boolean>>>,
            Expect<Equal<Result["data/version/detail"], NotPayload<boolean>>>,
        ];
    });

    test("通配符在结尾", () => {
        type Events = {
            "user/profile/*": string;
            "api/v1/*": number;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["user/profile/settings"], NotPayload<string>>>,
            Expect<Equal<Result["user/profile/avatar"], NotPayload<string>>>,
            Expect<Equal<Result["api/v1/users"], NotPayload<number>>>,
            Expect<Equal<Result["api/v1/posts"], NotPayload<number>>>,
        ];
    });

    test("多个通配符组合", () => {
        type Events = {
            "*/*/test": boolean;
            "a/**/z": number;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["x/y/test"], NotPayload<boolean>>>,
            Expect<Equal<Result["1/2/test"], NotPayload<boolean>>>,
            Expect<Equal<Result["a/b/z"], NotPayload<number>>>,
            Expect<Equal<Result["a/b/c/z"], NotPayload<number>>>,
        ];
    });

    test("复杂嵌套路径", () => {
        type Events = {
            "admin/dashboard/**": { data: any };
            "user/*/orders/**": string[];
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type f = Result[`user/${string}/orders/${string}`];
        type cases = [
            Expect<Equal<Result[`admin/dashboard/${string}`], NotPayload<{ data: any }>>>,
            Expect<Equal<Result[`user/${string}/orders/${string}`], NotPayload<string[]>>>,
        ];
    });

    test("仅包含非通配符键", () => {
        type Events = {
            a: string;
            b: number;
            "c/d/e": boolean;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["a"], NotPayload<string>>>,
            Expect<Equal<Result["b"], NotPayload<number>>>,
            Expect<Equal<Result["c/d/e"], NotPayload<boolean>>>,
        ];
    });
    test("混合普通事件和已转换的事件", () => {
        type Events = {
            click: NotPayload<{ x: number; y: number }>;
            mousemove: boolean;
            "user/*": string;
            "user/login": NotPayload<{ userId: number }>;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["click"], NotPayload<NotPayload<{ x: number; y: number }>>>>,
            Expect<Equal<Result["mousemove"], NotPayload<boolean>>>,
            Expect<Equal<Result["user/login"], NotPayload<NotPayload<{ userId: number }>>>>,
            Expect<Equal<Result["user/logout"], NotPayload<string>>>,
        ];
    });

    test("嵌套路径通配符", () => {
        type Events = {
            "rooms/*/$join": { room: string; welcome: string; users: string[] };
            "rooms/*/$leave": string;
            "rooms/*/$error": string;
            "rooms/*/$add": string;
            "rooms/*/$remove": string;
            "rooms/*/*": number;
        };

        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<
                Equal<
                    Result[`rooms/${string}/$join`],
                    NotPayload<{ room: string; welcome: string; users: string[] }> &
                        NotPayload<number>
                >
            >,
            Expect<
                Equal<Result[`rooms/${string}/$leave`], NotPayload<string> & NotPayload<number>>
            >,
            Expect<
                Equal<Result[`rooms/${string}/$error`], NotPayload<string> & NotPayload<number>>
            >,
            Expect<Equal<Result[`rooms/${string}/$add`], NotPayload<string> & NotPayload<number>>>,
            Expect<
                Equal<Result[`rooms/${string}/$remove`], NotPayload<string> & NotPayload<number>>
            >,
            Expect<Equal<Result[`rooms/any/event`], NotPayload<number>>>,
        ];
    });

    test("通配符与精确路径混合", () => {
        type Events = {
            "devices/*/status": "online" | "offline";
            "devices/**": number;
            "devices/sensor1/status": "connected" | "disconnected";
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;

        type cases = [
            Expect<
                Equal<Result["devices/sensor1/status"], NotPayload<"connected" | "disconnected">>
            >,
            Expect<
                Equal<
                    Result["devices/sensor2/status"],
                    NotPayload<"online" | "offline"> & NotPayload<number>
                >
            >,
            Expect<Equal<Result["devices/sensor1"], NotPayload<number>>>,
            Expect<Equal<Result["devices/sensor1/data"], NotPayload<number>>>,
            // Expect<Equal<Result["devices"], NotPayload<number>>>,
        ];
    });

    test("复杂 Web 应用场景", () => {
        type Events = {
            "users/*/online": { name: string; status?: number };
            "users/*/offline": boolean;
            "users/*/*": string;
            "posts/*/view": number;
            "posts/*/comment": string;
            "posts/**": { title: string; views: number };
            "devices/*/status": "online" | "offline";
            "devices/**": number;
            "*": string;
            "**": any;
        };
        type Result = TransformedEvents<Events>;

        type ddd = GetMatchedEventPayload<Result, "users/john/online">;

        type OnlinePayload = GetMatchedEventPayload<Result, "users/john/online">;
        type OfflinePayload = GetMatchedEventPayload<Result, "users/john/offline">;
        type ProfilePayload = GetMatchedEventPayload<Result, "users/john/profile">;
        type PostsView = GetMatchedEventPayload<Result, "posts/123/view">;
        type PostsComment = GetMatchedEventPayload<Result, "posts/123/comment">;
        type Anything = GetMatchedEventPayload<Result, "anything">;
        type Posts123 = GetMatchedEventPayload<Result, "posts/123">;
        type DevicesStatus = GetMatchedEventPayload<Result, "devices/sensor1/status">;
        type DevicesData = GetMatchedEventPayload<Result, "devices/sensor1/data">;
        type AnyNestedPath = GetMatchedEventPayload<Result, "any/nested/patha">;
        type Posts = GetMatchedEventPayload<Result, "posts">;

        type cases = [
            Expect<
                Equal<
                    OnlinePayload,
                    | NotPayload<{ name: string; status?: number }>
                    | NotPayload<string>
                    | NotPayload<any>
                >
            >,
            Expect<
                Equal<OfflinePayload, NotPayload<boolean> | NotPayload<string> | NotPayload<any>>
            >,
            Expect<Equal<ProfilePayload, NotPayload<string> | NotPayload<any>>>,
            Expect<
                Equal<
                    PostsView,
                    | NotPayload<{ title: string; views: number }>
                    | NotPayload<number>
                    | NotPayload<any>
                >
            >,
            Expect<
                Equal<
                    PostsComment,
                    | NotPayload<{ title: string; views: number }>
                    | NotPayload<string>
                    | NotPayload<any>
                >
            >,
            Expect<Equal<Anything, NotPayload<string> | NotPayload<any>>>,
            Expect<Equal<Posts123, NotPayload<{ title: string; views: number }> | NotPayload<any>>>,
            Expect<
                Equal<
                    DevicesStatus,
                    NotPayload<"online" | "offline"> | NotPayload<number> | NotPayload<any>
                >
            >,
            Expect<Equal<DevicesData, NotPayload<number> | NotPayload<any>>>,
            Expect<Equal<AnyNestedPath, NotPayload<any>>>,
            Expect<Equal<Posts, NotPayload<string> | NotPayload<any>>>,
        ];
    });

    test("特殊字符路径", () => {
        type Events = {
            "events/$created": { id: number };
            "events/$updated/*": boolean;
            "events/*/$deleted": string;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            Expect<Equal<Result["events/$created"], NotPayload<{ id: number }>>>,
            Expect<Equal<Result["events/$updated/test"], NotPayload<boolean>>>,
            Expect<Equal<Result["events/test/$deleted"], NotPayload<string>>>,
        ];
    });

    test("类型保持一致性", () => {
        type Events = {
            click: NotPayload<{ x: number; y: number }>;
            "div/click": NotPayload<{ x: number; y: number; target: string }>;
            "*/click": NotPayload<{ x: number; y: number }>;
        };
        type Result = ExtendWildcardEvents<TransformedEvents<Events>>;
        type cases = [
            // 确保所有 click 事件都被正确包装为 NotPayload
            Expect<Equal<Result["click"], NotPayload<NotPayload<{ x: number; y: number }>>>>,
            Expect<
                Equal<
                    Result["div/click"],
                    NotPayload<NotPayload<{ x: number; y: number; target: string }>>
                >
            >,
            Expect<Equal<Result["button/click"], NotPayload<NotPayload<{ x: number; y: number }>>>>,
        ];
    });
});

type Result = {
    [x: `users/${string}/online`]: NotPayload<{
        name: string;
        status?: number;
    }>;
};
