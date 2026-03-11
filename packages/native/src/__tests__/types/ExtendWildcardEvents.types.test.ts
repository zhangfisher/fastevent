/* eslint-disable no-unused-vars */

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { type ExtendWildcardEvents } from "../../types/wildcards/ExtendWildcardEvents";

describe("ExtendWildcardEvents", () => {
    test("非通配符事件保持不变", () => {
        type Events = {
            click: { x: number; y: number };
            mousemove: boolean;
            "user/login": string;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["click"], { x: number; y: number }>>,
            Expect<Equal<Result["mousemove"], boolean>>,
            Expect<Equal<Result["user/login"], string>>,
        ];
    });

    test("单级通配符 * 扩展为模板字面量类型", () => {
        type Events = {
            "user/*": string;
            "api/v1/*": number;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["user/login"], string>>,
            Expect<Equal<Result["user/logout"], string>>,
            Expect<Equal<Result["user/profile"], string>>,
            Expect<Equal<Result["api/v1/users"], number>>,
            Expect<Equal<Result["api/v1/posts"], number>>,
        ];
    });

    test("多级通配符 ** 扩展为递归模板字面量类型", () => {
        type Events = {
            "data/**": boolean;
            "user/profile/**": { id: number };
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["data/users"], boolean>>,
            Expect<Equal<Result["data/users/posts"], boolean>>,
            Expect<Equal<Result["data/a/b/c/d"], boolean>>,
            Expect<Equal<Result["user/profile/settings"], { id: number }>>,
            Expect<Equal<Result["user/profile/a/b/c"], { id: number }>>,
        ];
    });

    test("混合通配符扩展", () => {
        type Events = {
            "div/click/*": { x: number; y: number };
            "x/*/y/*": number;
            "simple*test": string;
            "no/wildcard": string[];
            "*/*/*/*": 1;
            "*": 2;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            // 单级通配符扩展
            Expect<Equal<Result["div/click/button"], { x: number; y: number }>>,
            Expect<Equal<Result["div/click/anything"], { x: number; y: number }>>,
            // 多个单级通配符
            Expect<Equal<Result["x/123/y/456"], 1>>,
            // 中间通配符
            Expect<Equal<Result["simpleWildcardtest"], 2>>,
            Expect<Equal<Result["simpleXYZtest"], 2>>,
            // 非通配符保持不变
            Expect<Equal<Result["no/wildcard"], string[]>>,
            // 全局通配符
            Expect<Equal<Result["a/b/c/d"], 1>>,
            Expect<Equal<Result["anything"], 2>>,
        ];
    });

    test("优先级：精确键覆盖通配符扩展", () => {
        type Events = {
            "user/*": string;
            "user/login": { userId: number }; // 精确键应该覆盖通配符
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            // 精确键优先
            Expect<Equal<Result["user/login"], { userId: number }>>,
            // 通配符扩展的其他键
            Expect<Equal<Result["user/logout"], string>>,
            Expect<Equal<Result["user/profile"], string>>,
        ];
    });

    test("通配符在开头", () => {
        type Events = {
            "*/click": { target: string };
            "*/user/profile": { name: string };
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["div/click"], { target: string }>>,
            Expect<Equal<Result["button/click"], { target: string }>>,
            Expect<Equal<Result["admin/user/profile"], { name: string }>>,
            Expect<Equal<Result["guest/user/profile"], { name: string }>>,
        ];
    });

    test("通配符存在覆盖的情况", () => {
        type Events = {
            "rooms/*/$join": { room: string; welcome: string; users: string[] };
            "rooms/*/$leave": string;
            "rooms/*/$error": string;
            "rooms/*/$add": string;
            "rooms/*/$remove": string;
            "rooms/*/*": number;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [];
    });

    test("通配符在中间", () => {
        type Events = {
            "api/*/users": number[];
            "data/v*/detail": boolean;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["api/v1/users"], number[]>>,
            Expect<Equal<Result["api/v2/users"], number[]>>,
            Expect<Equal<Result["data/v*/detail"], boolean>>,
        ];
    });

    test("通配符在结尾", () => {
        type Events = {
            "user/profile/*": string;
            "api/v1/*": number;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["user/profile/settings"], string>>,
            Expect<Equal<Result["user/profile/avatar"], string>>,
            Expect<Equal<Result["api/v1/users"], number>>,
            Expect<Equal<Result["api/v1/posts"], number>>,
        ];
    });

    test("多个通配符组合", () => {
        type Events = {
            "*/*/test": boolean;
            "a/**/z": number;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result["x/y/test"], boolean>>,
            Expect<Equal<Result["1/2/test"], boolean>>,
            Expect<Equal<Result["a/b/z"], number>>,
            Expect<Equal<Result["a/b/c/z"], number>>,
        ];
    });

    test("复杂嵌套路径", () => {
        type Events = {
            "admin/dashboard/**": { data: any };
            "user/*/orders": string[];
            "api/v1/*": number;
            "docs/*": boolean;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            // 多级通配符测试 - 匹配任意深层路径
            Expect<Equal<Result["admin/dashboard/stats"], { data: any }>>,
            Expect<Equal<Result["admin/dashboard/users/active"], { data: any }>>,
            // 单级通配符在中间
            Expect<Equal<Result["user/123/orders"], string[]>>,
            Expect<Equal<Result["user/456/orders"], string[]>>,
            // 单级通配符在末尾
            Expect<Equal<Result["api/v1/users"], number>>,
            Expect<Equal<Result["api/v1/posts"], number>>,
            Expect<Equal<Result["docs/guide"], boolean>>,
            Expect<Equal<Result["docs/readme"], boolean>>,
        ];
    });

    test("空对象处理", () => {
        type Events = {};
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            // 空对象应该返回空对象
            Expect<Equal<keyof Result, never>>,
        ];
    });

    test("仅包含非通配符键", () => {
        type Events = {
            a: string;
            b: number;
            "c/d/e": boolean;
        };
        type Result = ExtendWildcardEvents<Events>;
        type cases = [
            Expect<Equal<Result, Events>>,
            Expect<Equal<keyof Result, "a" | "b" | "c/d/e">>,
        ];
    });

    test("仅包含通配符键", () => {
        type Events = {
            "global/*": string;
            "a/*": boolean;
            "x/y/*": number;
        };
        type Result = ExtendWildcardEvents<Events>;
        // 测试具体路径能够匹配
        type Test1 = Result["global/test"];
        type Test2 = Result["a/path"];
        type Test3 = Result["x/y/deep"];
        type cases = [
            Expect<Equal<Test1, string>>,
            Expect<Equal<Test2, boolean>>,
            Expect<Equal<Test3, number>>,
        ];
    });

    test("RemoveEmptyObject 正确处理交叉类型", () => {
        type Events = {
            "exact/key": { type: "exact" };
            "wild/*": { type: "wild" };
        };
        type Result = ExtendWildcardEvents<Events>;
        // 确保结果是平坦的对象类型，不是交叉类型
        type cases = [
            Expect<Equal<Result["exact/key"], { type: "exact" }>>,
            Expect<Equal<Result["wild/test"], { type: "wild" }>>,
        ];
    });
});
