/* eslint-disable no-unused-vars */
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import type { ScopeEvents } from "../../types/ScopeEvents";

describe("ScopeEvents 类型测试", () => {
    test("基础前缀匹配 - 单级前缀", () => {
        type Events = {
            a: 1;
            "a/b": 2;
            "a/b/c": 3;
            "a/*/x": string;
            b: 4;
            "b/c": 5;
        };

        type Result = ScopeEvents<Events, "a">;
        type cases = [
            // 精确匹配 'a'，剩余为空，应该被过滤掉
            Expect<Equal<"a" extends keyof Result ? true : false, false>>,
            // 'a/b' 去掉 'a/' 前缀后变为 'b'
            Expect<Equal<Result["b"], 2>>,
            // 'a/b/c' 去掉 'a/' 前缀后变为 'b/c'
            Expect<Equal<Result["b/c"], 3>>,
            // 'a/*/x' 去掉 'a/' 前缀后变为 '*/x'
            Expect<Equal<Result[`*/x`], string>>,
            // 'b' 和 'b/c' 不匹配前缀 'a'
            Expect<Equal<"b" extends keyof Result ? false : true, false>>,
            Expect<Equal<"b/c" extends keyof Result ? false : true, false>>,
        ];
    });

    test("基础前缀匹配 - 多级前缀", () => {
        type Events = {
            "rooms/1/add": boolean;
            "rooms/1/join": boolean;
            "rooms/1/leave": boolean;
            "rooms/2/add": boolean;
            "rooms/*/remove": boolean;
            "users/fisher/login": string;
            "users/fisher/logout": number;
        };

        type Result = ScopeEvents<Events, "rooms/1">;
        type cases = [
            // 'rooms/1/add' 去掉 'rooms/1/' 前缀后变为 'add'
            Expect<Equal<Result["add"], boolean>>,
            // 'rooms/1/join' 去掉 'rooms/1/' 前缀后变为 'join'
            Expect<Equal<Result["join"], boolean>>,
            // 'rooms/1/leave' 去掉 'rooms/1/' 前缀后变为 'leave'
            Expect<Equal<Result["leave"], boolean>>,
            // 'rooms/*/remove' 匹配前缀，去掉 'rooms/1/' 后变为 '*/remove'
            Expect<Equal<Result[`remove`], boolean>>,
            // 'rooms/2/add' 不匹配前缀 'rooms/1'
            Expect<Equal<"add" extends keyof Result ? true : false, true>>,
            // users 相关事件不匹配
            Expect<Equal<"login" extends keyof Result ? true : false, false>>,
        ];
    });

    test("通配符前缀匹配", () => {
        type Events = {
            a: 1;
            "a/*": string;
            "a/a1/*": string;
            "a/a2": string;
            "a/*/x": string;
            "b/*": number;
            "b/*/y": number;
            "c/*": boolean;
        };

        type Result = ScopeEvents<Events, "a">;
        type cases = [
            // 'a' 精确匹配后剩余为空，应该被过滤
            Expect<Equal<"a" extends keyof Result ? false : true, true>>,
            // 'a/*' 去掉 'a/' 后变为 '*'
            Expect<Equal<Result["*"], string>>,
            // 'a/a1/*' 去掉 'a/' 后变为 'a1/*'
            Expect<Equal<Result["a1/*"], string>>,
            // 'a/a2' 去掉 'a/' 后变为 'a2'
            Expect<Equal<Result["a2"], string>>,
            // 'a/*/x' 去掉 'a/' 后变为 '*/x'
            Expect<Equal<Result[`*/x`], string>>,
            // b 和 c 相关事件不匹配前缀 'a'
            Expect<Equal<"b/c" extends keyof Result ? false : true, true>>,
        ];
    });

    test("多级通配符前缀", () => {
        type Events = {
            "users/*/profile/update": { name: string };
            "users/*/profile/delete": { id: number };
            "users/*/settings/update": { settings: any };
            "users/admin/profile/update": { admin: boolean };
        };

        type Result = ScopeEvents<Events, "users/*/profile">;
        type cases = [
            // 'users/*/profile/update' 去掉 'users/*/profile/' 后变为 'update'
            Expect<Equal<Result["update"], { name: string }>>,
            // 'users/*/profile/delete' 去掉 'users/*/profile/' 后变为 'delete'
            Expect<Equal<Result["delete"], { id: number }>>,
            // 'users/*/settings/update' 不匹配前缀 'users/*/profile'
            Expect<Equal<"update" extends keyof Result ? true : false, true>>,
        ];
    });

    test("完全匹配场景", () => {
        type Events = {
            "rooms/c/add": boolean;
            "rooms/c/join": boolean;
            "rooms/c/leave": boolean;
        };

        type Result = ScopeEvents<Events, "rooms/c">;
        type cases = [
            // 所有事件都应该去掉前缀 'rooms/c/'
            Expect<Equal<keyof Result, "add" | "join" | "leave">>,
            Expect<Equal<Result["add"], boolean>>,
            Expect<Equal<Result["join"], boolean>>,
            Expect<Equal<Result["leave"], boolean>>,
        ];
    });

    test("复杂嵌套路径", () => {
        type Events = {
            "x/y/z/a": 1;
            "x/y/z/b": 2;
            "x/y/z/c": 3;
            "x/y/a": 4;
            "x/a": 5;
        };

        type Result1 = ScopeEvents<Events, "x">;
        type cases1 = [
            Expect<Equal<Result1["y/z/a"], 1>>,
            Expect<Equal<Result1["y/z/b"], 2>>,
            Expect<Equal<Result1["y/z/c"], 3>>,
            Expect<Equal<Result1["y/a"], 4>>,
            Expect<Equal<Result1["a"], 5>>,
        ];

        type Result2 = ScopeEvents<Events, "x/y">;
        type cases2 = [
            Expect<Equal<Result2["z/a"], 1>>,
            Expect<Equal<Result2["z/b"], 2>>,
            Expect<Equal<Result2["z/c"], 3>>,
            Expect<Equal<Result2["a"], 4>>,
        ];

        type Result3 = ScopeEvents<Events, "x/y/z">;
        type cases3 = [
            Expect<Equal<Result3["a"], 1>>,
            Expect<Equal<Result3["b"], 2>>,
            Expect<Equal<Result3["c"], 3>>,
        ];
    });

    test("通配符与具体路径混合", () => {
        type Events = {
            "api/v1/users/get": { users: any[] };
            "api/v1/users/create": { user: any };
            "api/v1/posts/get": { posts: any[] };
            "api/v2/users/get": { users: any[]; version: 2 };
            "api/*/health": { status: string };
        };

        type Result = ScopeEvents<Events, "api/v1">;
        type cases = [
            Expect<Equal<Result["users/get"], { users: any[] }>>,
            Expect<Equal<Result["users/create"], { user: any }>>,
            Expect<Equal<Result["posts/get"], { posts: any[] }>>,
            // 'api/*/health' 匹配，去掉 'api/v1/' 后变为 '*/health'
            Expect<Equal<Result[`health`], { status: string }>>,
            // 'api/v2/users/get' 不匹配 'api/v1'
            Expect<Equal<"users/get" extends keyof Result ? true : false, true>>,
        ];
    });

    test("边界情况 - 空前缀", () => {
        type Events = {
            a: 1;
            "b/c": 2;
        };

        type Result = ScopeEvents<Events, "">;
        type cases = [
            // 空前缀应该返回所有事件
            Expect<Equal<Result["a"], 1>>,
            Expect<Equal<Result["b/c"], 2>>,
        ];
    });

    test("边界情况 - 不存在的所有前缀", () => {
        type Events = {
            a: 1;
            "b/c": 2;
        };

        type Result = ScopeEvents<Events, "nonexistent">;
        type cases = [
            // 不匹配任何前缀，应该返回空对象
            Expect<Equal<Result, Record<string, any>>>,
        ];
    });

    test("通配符匹配多个事件", () => {
        type Events = {
            "div/*/click": { x: number; y: number };
            "div/*/hover": { x: number; y: number };
            "span/*/click": { x: number; y: number };
        };

        type Result = ScopeEvents<Events, "div">;
        type cases = [
            Expect<Equal<Result[`*/click`], { x: number; y: number }>>,
            Expect<Equal<Result[`*/hover`], { x: number; y: number }>>,
            // 'span/*/click' 不匹配前缀 'div'
            Expect<Equal<"click" extends keyof Result ? true : false, false>>,
        ];
    });

    test("深层嵌套的通配符", () => {
        type Events = {
            "a/*/c/*/e": string;
            "a/*/c/*/d": number;
            "a/b/c/d/e": boolean;
        };

        type Result = ScopeEvents<Events, "a">;
        type cases = [
            Expect<Equal<Result[`*/c/*/e`], string>>,
            Expect<Equal<Result[`*/c/*/d`], number>>,
            Expect<Equal<Result["b/c/d/e"], boolean>>,
        ];

        type Result2 = ScopeEvents<Events, "a/*/c">;
        type cases2 = [
            Expect<Equal<Result2["*/e"], string>>,
            Expect<Equal<Result2["*/d"], number>>,
        ];
    });

    test("实际应用场景 - 聊天室事件", () => {
        type ChatEvents = {
            "rooms/*/message": { content: string; userId: string };
            "rooms/*/join": { userId: string };
            "rooms/*/leave": { userId: string };
            "rooms/*/typing": { userId: string; isTyping: boolean };
            "users/*/online": { lastSeen: number };
            "users/*/offline": never;
        };

        // 创建特定房间的作用域
        type Room123Events = ScopeEvents<ChatEvents, "rooms/123">;
        type roomCases = [
            Expect<Equal<Room123Events["message"], { content: string; userId: string }>>,
            Expect<Equal<Room123Events["join"], { userId: string }>>,
            Expect<Equal<Room123Events["leave"], { userId: string }>>,
            Expect<Equal<Room123Events["typing"], { userId: string; isTyping: boolean }>>,
            // 用户事件不在房间作用域中
            Expect<Equal<"online" extends keyof Room123Events ? true : false, false>>,
        ];

        // 创建用户作用域
        type User456Events = ScopeEvents<ChatEvents, "users/456">;
        type userCases = [
            Expect<Equal<User456Events["online"], { lastSeen: number }>>,
            Expect<Equal<User456Events["offline"], never>>,
        ];
    });

    test("实际应用场景 - API 事件", () => {
        type APIEvents = {
            "api/*/request": { method: string; path: string };
            "api/*/response": { status: number; data: any };
            "api/*/error": { error: Error };
            "api/v1/users/create": { name: string; email: string };
            "api/v1/users/update": { id: number; changes: any };
            "api/v2/users/create": { name: string; email: string; version: 2 };
        };

        type V1APIEvents = ScopeEvents<APIEvents, "api/v1">;
        type v1Cases = [
            Expect<Equal<V1APIEvents["request"], { method: string; path: string }>>,
            Expect<Equal<V1APIEvents["response"], { status: number; data: any }>>,
            Expect<Equal<V1APIEvents["error"], { error: Error }>>,
            Expect<Equal<V1APIEvents["users/create"], { name: string; email: string }>>,
            Expect<Equal<V1APIEvents["users/update"], { id: number; changes: any }>>,
        ];
    });

    describe("Default 参数功能测试", () => {
        test("空前缀返回原始 Events", () => {
            type Events = {
                a: 1;
                "b/c": 2;
                "x/y/z": 3;
            };

            type Result = ScopeEvents<Events, "">;
            type cases = [
                // 空前缀应该返回原始 Events
                Expect<Equal<Result, Events>>,
                Expect<Equal<Result["a"], 1>>,
                Expect<Equal<Result["b/c"], 2>>,
                Expect<Equal<Result["x/y/z"], 3>>,
            ];
        });

        test("不匹配的前缀返回 Default", () => {
            type Events = {
                a: 1;
                "b/c": 2;
                "x/y/z": 3;
            };

            type DefaultEvents = {
                fallback: string;
                "other/event": number;
            };

            type Result = ScopeEvents<Events, "nonexistent", DefaultEvents>;
            type cases = [
                // 不匹配任何前缀，应该返回 Default
                Expect<Equal<Result, DefaultEvents>>,
                Expect<Equal<Result["fallback"], string>>,
                Expect<Equal<Result["other/event"], number>>,
            ];
        });

        test("不匹配的前缀返回空对象（默认 Default）", () => {
            type Events = {
                a: 1;
                "b/c": 2;
            };

            type Result = ScopeEvents<Events, "nonexistent">;
            type cases = [
                // 不匹配任何前缀，Default 默认为空对象
                Expect<Equal<Result, Record<string, any>>>,
            ];
        });

        test("匹配的前缀正常工作，不影响 Default", () => {
            type Events = {
                a: 1;
                "b/c": 2;
                "x/y": 3;
            };

            type DefaultEvents = {
                fallback: string;
            };

            // 匹配的前缀应该返回匹配的事件，不使用 Default
            type MatchedResult = ScopeEvents<Events, "b", DefaultEvents>;
            type matchedCases = [
                Expect<Equal<MatchedResult["c"], 2>>,
                // Default 不应该出现在匹配的结果中
                Expect<Equal<"fallback" extends keyof MatchedResult ? true : false, false>>,
            ];
        });

        test("实际应用 - API 版本回退", () => {
            type APIEvents = {
                "v1/users": { name: string };
                "v1/posts": { title: string };
                "v2/users": { name: string; email: string };
                "v2/posts": { title: string; content: string };
            };

            type DefaultAPIEvents = {
                error: { message: string; code: number };
            };

            // v3 版本不存在，应该返回 Default
            type V3Events = ScopeEvents<APIEvents, "v3", DefaultAPIEvents>;
            type v3Cases = [
                Expect<Equal<V3Events, DefaultAPIEvents>>,
                Expect<Equal<V3Events["error"], { message: string; code: number }>>,
            ];

            // v1 版本存在，应该返回 v1 的事件
            type V1Events = ScopeEvents<APIEvents, "v1", DefaultAPIEvents>;
            type v1Cases = [
                Expect<Equal<V1Events["users"], { name: string }>>,
                Expect<Equal<V1Events["posts"], { title: string }>>,
                // V1Events 应该只包含 users 和 posts，不包含 error
                Expect<Equal<keyof V1Events, "users" | "posts">>,
            ];

            // 空前缀应该返回原始 Events
            type AllEvents = ScopeEvents<APIEvents, "", DefaultAPIEvents>;
            type allCases = [
                Expect<Equal<AllEvents, APIEvents>>,
                Expect<Equal<AllEvents["v1/users"], { name: string }>>,
                Expect<Equal<AllEvents["v2/users"], { name: string; email: string }>>,
            ];
        });
    });
});
