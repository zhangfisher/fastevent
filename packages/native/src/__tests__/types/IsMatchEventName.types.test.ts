// oxlint-disable no-unused-vars
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import type { IsMatchEventName } from "../../types/wildcards/IsMatchEventName";
import { AssertString } from "../../types/utils/AssertString";
import { UnionToTuple } from "type-fest";
import { Tuple } from "../../types";

describe("IsMatchEventName 类型测试", () => {
    test("精确匹配 - 完全相同的事件名", () => {
        type Result1 = IsMatchEventName<"user/login", "user/login">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"click", "click">;
        type cases2 = [Expect<Equal<Result2, true>>];
    });

    test("精确匹配 - 不同的事件名", () => {
        type Result1 = IsMatchEventName<"user/login", "user/logout">;
        type cases1 = [Expect<Equal<Result1, false>>];

        type Result2 = IsMatchEventName<"click", "hover">;
        type cases2 = [Expect<Equal<Result2, false>>];
    });

    test("单级通配符 * - 匹配下一级", () => {
        type Result1 = IsMatchEventName<"user/login", "user/*">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"user/logout", "user/*">;
        type cases2 = [Expect<Equal<Result2, true>>];

        type Result3 = IsMatchEventName<"api/v1/users", "api/v1/*">;
        type cases3 = [Expect<Equal<Result3, true>>];
    });

    test("单级通配符 * - 前缀不匹配", () => {
        type Result1 = IsMatchEventName<"admin/login", "user/*">;
        type cases1 = [Expect<Equal<Result1, false>>];
    });

    test("单级通配符 * - 级别不匹配", () => {
        type Result1 = IsMatchEventName<"user", "user/*">;
        type cases1 = [Expect<Equal<Result1, false>>];

        type Result2 = IsMatchEventName<"user/profile/edit", "user/*">;
        type cases2 = [Expect<Equal<Result2, false>>];
    });

    test("单级通配符 * - 在开头应匹配", () => {
        type Result1 = IsMatchEventName<"user/login", "*/login">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"admin/login", "*/login">;
        type cases2 = [Expect<Equal<Result2, true>>];
    });

    test("单级通配符 * - 多个通配符", () => {
        type Result1 = IsMatchEventName<"a/b/c", "*/*/*">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"user/profile/edit", "user/*/edit">;
        type cases2 = [Expect<Equal<Result2, true>>];

        type Result3 = IsMatchEventName<"user/profile/edit", "*/profile/*">;
        type cases3 = [Expect<Equal<Result3, true>>];
    });

    test("多级通配符 ** - 匹配后续所有级别", () => {
        type Result1 = IsMatchEventName<"user/login", "user/**">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"user/profile/edit", "user/**">;
        type cases2 = [Expect<Equal<Result2, true>>];

        type Result3 = IsMatchEventName<"api/v1/users/create", "api/v1/**">;
        type cases3 = [Expect<Equal<Result3, true>>];
    });

    test("多级通配符 ** - 前缀不匹配", () => {
        type Result1 = IsMatchEventName<"admin/login", "user/**">;
        type cases1 = [Expect<Equal<Result1, false>>];
    });

    test("多级通配符 ** - 级别不匹配", () => {
        type Result1 = IsMatchEventName<"user", "user/**">;
        type cases1 = [Expect<Equal<Result1, false>>];
    });

    test("全通配符 ** - 匹配任何路径", () => {
        type Result1 = IsMatchEventName<"anything", "**">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"a/b/c/d", "**">;
        type cases2 = [Expect<Equal<Result2, true>>];

        type Result3 = IsMatchEventName<"", "**">;
        type cases3 = [Expect<Equal<Result3, true>>];
    });

    test("根级多级通配符 /** - 匹配任何路径", () => {
        type Result1 = IsMatchEventName<"anything", "/**">;
        type cases1 = [Expect<Equal<Result1, false>>];

        type Result2 = IsMatchEventName<"a/b/c", "/**">;
        type cases2 = [Expect<Equal<Result2, false>>];
    });

    test("多级通配符 ** - 不在末尾时应不匹配", () => {
        type Result1 = IsMatchEventName<"user/login", "**/login">;
        type cases1 = [Expect<Equal<Result1, false>>];
    });

    test("边界情况 - 单星号", () => {
        type Result1 = IsMatchEventName<"*", "*">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"a", "*">;
        type cases2 = [Expect<Equal<Result2, true>>];

        type Result3 = IsMatchEventName<"a/b", "*">;
        type cases3 = [Expect<Equal<Result3, false>>];
    });

    test("联合类型 - 匹配其中一个模式", () => {
        type Result1 = IsMatchEventName<"user/login", "user/login" | "admin/*">;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<"user/login", "user/logout" | "admin/*">;
        type cases2 = [Expect<Equal<Result2, false>>];

        type Result3 = IsMatchEventName<"admin/login", "user/login" | "admin/*">;
        type cases3 = [Expect<Equal<Result3, true>>];

        type Result4 = IsMatchEventName<
            "users/aaa/login",
            "users/*/login" | "admin/*"
        >;
        type cases4 = [Expect<Equal<Result4, true>>];
    });

    test("联合类型 - 复杂模式", () => {
        type Result1 = IsMatchEventName<
            "users/aaa/login",
            "users/*/login" | `users/${string}/login`
        >;
        type cases1 = [Expect<Equal<Result1, true>>];

        type Result2 = IsMatchEventName<
            "users/bbb/login",
            "users/*/login" | `users/${string}/logout`
        >;
        type cases2 = [Expect<Equal<Result2, true>>];
    });

    test("ddd", () => {
        type R1 = IsMatchEventName<
            "users/aaa/login",
            "users/*/login" | Omit<`users/${string}/login`, "users/*/login">
        >;
        type R2 = IsMatchEventName<
            "users/aaa/login",
            AssertString<"users/*/login" | Omit<`users/${string}/login`, "users/*/login">>
        >;
        type ddd = "users/*/login" | Omit<`users/${string}/login`, "users/*/login"> extends string[]
            ? true
            : false;
    });
});
