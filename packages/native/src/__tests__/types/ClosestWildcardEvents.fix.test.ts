/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { GetClosestEvents } from "../../types/WildcardEvents";

describe("ClosestWildcardEvents 修复验证 - 用户报告的问题", () => {
    test("原始问题：users/fisher/login 应该匹配 users/*/login 而不是 users/*/*", () => {
        interface ResultEvents {
            "users/*/*": { name: string; vip: boolean };
            "users/*/login": string;
        }

        // 这是用户报告的原始问题
        type f3 = GetClosestEvents<ResultEvents, `users/fisher/login`>;

        // 期望：返回 users/*/login（2个固定段）而不是 users/*/*（1个固定段）
        type cases = [
            // 修复前：返回 { "users/*/*": { name: string; vip: boolean } } ❌
            // 修复后：返回 { "users/*/login": string } ✅
            Expect<Equal<f3, { "users/*/login": string }>>,
        ];
    });

    test("验证固定段优先级逻辑", () => {
        interface Events {
            "a/b/c": number; // 3个固定段
            "a/*/c": string; // 2个固定段 + 1个通配符
            "a/*/*": boolean; // 1个固定段 + 2个通配符
        }

        // 对于 a/b/c：
        // - a/b/c: 精确匹配，3个固定段
        // - a/*/c: 2个固定段
        // - a/*/*: 1个固定段
        type Result = GetClosestEvents<Events, "a/b/c">;

        type cases = [Expect<Equal<Result, { "a/b/c": number }>>];
    });

    test("复杂场景：rooms/*/lobby/$join vs rooms/*/*/$join", () => {
        interface Events {
            "rooms/*/lobby/$join": { room: string; welcome: string; users: string[] };
            "rooms/*/*/$join": { room: string; message: string };
        }

        // 对于 rooms/123/lobby/$join：
        // - rooms/*/lobby/$join: 3个固定段 → 应该优先
        // - rooms/*/*/$join: 2个固定段
        type Result = GetClosestEvents<Events, "rooms/123/lobby/$join">;

        type cases = [
            Expect<
                Equal<
                    Result,
                    { "rooms/*/lobby/$join": { room: string; welcome: string; users: string[] } }
                >
            >,
        ];
    });

    test("验证通配符匹配规则", () => {
        // * 只能匹配独立段
        // ** 匹配多个段且只能用于末尾

        interface Events {
            "rooms/*": boolean; // 匹配 rooms/<任意单段>
            "rooms/**": string; // 匹配 rooms/<任意多段>
            "rooms/*/lobby": number; // 匹配 rooms/<任意段>/lobby
        }

        type Result1 = GetClosestEvents<Events, "rooms/123">;
        type Result2 = GetClosestEvents<Events, "rooms/123/456">;
        type Result3 = GetClosestEvents<Events, "rooms/123/lobby">;

        type cases = [
            // rooms/123 只匹配 rooms/*（1个固定段）
            Expect<Equal<Result1, { "rooms/*": boolean }>>,

            // rooms/123/456 只匹配 rooms/**（0个固定段）
            Expect<Equal<Result2, { "rooms/**": string }>>,

            // rooms/123/lobby 同时匹配 rooms/*/lobby（2个固定段）和 rooms/**（0个固定段）
            // 应该选择固定段多的 rooms/*/lobby
            Expect<Equal<Result3, { "rooms/*/lobby": number }>>,
        ];
    });
});
