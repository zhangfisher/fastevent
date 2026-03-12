/* eslint-disable no-unused-vars */
import { describe, test, expect } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { MutableMessage } from "../../types/MutableMessage";
import { ReplaceWildcard } from "../../types/wildcards/ReplaceWildcard";
import { ContainsWildcard } from "../../types/wildcards/ContainsWildcard";

// PickByType 的实现
type PickByType<E, T extends string> = E extends {
    type: infer Type;
    payload: infer P;
    meta?: infer M;
}
    ? T extends Type
        ? {
              type: T;
              payload: P;
              meta?: M;
          }
        : never
    : never;

// 测试用例
type Events = {
    "users/*/login": { userId: number; timestamp: number };
    "users/*/logout": { userId: number };
    "div/*/click": { x: number; y: number };
};

type Message = MutableMessage<Events>;

describe("PickByType 调试分析", () => {
    test("分析 ReplaceWildcard 的行为", () => {
        // 测试 ReplaceWildcard 的输出
        type R1 = ReplaceWildcard<"users/*/login">;
        type R2 = ReplaceWildcard<"users/*/logout">;
        type R3 = ReplaceWildcard<"div/*/click">;

        // R1, R2, R3 应该都是 `users/${string}/login` 等模板字符串类型
        const test: R1 = "users/abc/login"; // 应该能赋值
        // const test2: R1 = "users/*/login"; // 不应该能赋值（如果 R1 是纯模板字符串）

        type cases = [
            // 验证 ReplaceWildcard 的结果
            Expect<Equal<R1, `users/${string}/login`>>,
            Expect<Equal<R2, `users/${string}/logout`>>,
            Expect<Equal<R3, `div/${string}/click`>>,
        ];
    });

    test("分析 EnsureEventType 的行为", () => {
        // EnsureEventType<K> = K | Omit<ReplaceWildcard<K>, K>
        // 但实际上 Omit<ReplaceWildcard<K>, K> 不会排除任何东西，因为 K 是字面量类型
        // 所以结果应该是 K | ReplaceWildcard<K>

        type E1 = "users/*/login" | (Omit<ReplaceWildcard<"users/*/login">, "users/*/login">);
        // E1 实际上等价于 "users/*/login" | `users/${string}/login`

        const test1: E1 = "users/*/login"; // 应该能赋值
        const test2: E1 = "users/abc/login"; // 应该能赋值

        type cases = [
            Expect<Equal<E1, "users/*/login" | `users/${string}/login`>>,
        ];
    });

    test("分析 MutableMessage 的展开", () => {
        // MutableMessage<Events> 会展开为：
        // {
        //   type: "users/*/login" | `users/${string}/login`;
        //   payload: { userId: number; timestamp: number };
        //   meta?: Record<string, any>;
        // } | {
        //   type: "users/*/logout" | `users/${string}/logout`;
        //   payload: { userId: number };
        //   meta?: Record<string, any>;
        // } | {
        //   type: "div/*/click" | `div/${string}/click`;
        //   payload: { x: number; y: number };
        //   meta?: Record<string, any>;
        // }

        // 每个 type 字段都是包含两个成员的联合类型
    });

    test("分析 PickByType 的匹配逻辑", () => {
        // 当使用 PickByType<Message, "users/*/login"> 时：
        //
        // 分布式条件类型会遍历 Message 的每个成员：
        //
        // 成员1: { type: "users/*/login" | `users/${string}/login`; payload: {...} }
        //   检查: "users/*/login" extends ("users/*/login" | `users/${string}/login`)
        //   结果: true
        //   返回: { type: "users/*/login"; payload: {...} }
        //
        // 成员2: { type: "users/*/logout" | `users/${string}/logout`; payload: {...} }
        //   检查: "users/*/login" extends ("users/*/logout" | `users/${string}/logout`)
        //   结果: false
        //   返回: never
        //
        // 成员3: { type: "div/*/click" | `div/${string}/click`; payload: {...} }
        //   检查: "users/*/login" extends ("div/*/click" | `div/${string}/click`)
        //   结果: false
        //   返回: never
        //
        // 最终: M1 = { type: "users/*/login"; payload: {...} }

        type M1 = PickByType<Message, "users/*/login">;

        // 当使用 PickByType<Message, "users/abc/login"> 时：
        //
        // 成员1: { type: "users/*/login" | `users/${string}/login`; payload: {...} }
        //   检查: "users/abc/login" extends ("users/*/login" | `users/${string}/login`)
        //   - "users/abc/login" extends "users/*/login": false
        //   - "users/abc/login" extends `users/${string}/login`: true
        //   结果: true
        //   返回: { type: "users/abc/login"; payload: {...} }
        //
        // 成员2、3: 返回 never
        //
        // 最终: M2 = { type: "users/abc/login"; payload: {...} }

        type M2 = PickByType<Message, "users/abc/login">;

        type cases = [
            Expect<
                Equal<
                    M1,
                    {
                        type: "users/*/login";
                        payload: { userId: number; timestamp: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
            Expect<
                Equal<
                    M2,
                    {
                        type: "users/abc/login";
                        payload: { userId: number; timestamp: number };
                        meta?: Record<string, any>;
                    }
                >
            >,
        ];
    });

    test("验证为什么会出现三个类型的联合", () => {
        // 问题可能出在 Events 有多个匹配的事件键
        // 或者 ReplaceWildcard 的实现有特殊逻辑

        // 让我们检查是否因为有其他事件也匹配了相同的模式
        type AllKeys = keyof Events;
        // AllKeys = "users/*/login" | "users/*/logout" | "div/*/click"

        // 如果 Events 中有多个键在 ReplaceWildcard 后产生相同的模板字符串
        // 那么可能会导致重复
        //
        // 例如，如果有：
        // "users/*/login" -> `users/${string}/login`
        // "users/abc/login" -> `users/${string}/login`
        //
        // 那么这两个会被合并

        type cases = [
            Expect<Equal<AllKeys, "users/*/login" | "users/*/logout" | "div/*/click">>,
        ];
    });
});
