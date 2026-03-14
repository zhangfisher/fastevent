// oxlint-disable no-unused-vars
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { IsWildcardMatched } from "../../types/WildcardEvents";

describe("IsWildcardMatched 类型测试", () => {
    test("单星通配符匹配", () => {
        // 基本匹配
        type Test1 = IsWildcardMatched<"users/fisher/login", "users/*/login">;
        type cases1 = [Expect<Equal<Test1, true>>];

        // 不匹配
        type Test2 = IsWildcardMatched<"users/fisher/logout", "users/*/login">;
        type cases2 = [Expect<Equal<Test2, false>>];

        // 多个单星通配符
        type Test3 = IsWildcardMatched<"users/fisher/profile/update", "users/*/*/update">;
        type cases3 = [Expect<Equal<Test3, true>>];

        type Test4 = IsWildcardMatched<"users/fisher/profile/edit", "users/*/*/update">;
        type cases4 = [Expect<Equal<Test4, false>>];
    });

    test("双星通配符匹配（仅支持末尾）", () => {
        // 双星匹配多级路径
        type Test1 = IsWildcardMatched<"users/fisher/profile/update", "users/**">;
        type cases1 = [Expect<Equal<Test1, true>>];

        type Test2 = IsWildcardMatched<"users/fisher/login", "users/**">;
        type cases2 = [Expect<Equal<Test2, true>>];

        // 不匹配的情况
        type Test3 = IsWildcardMatched<"users/fisher/profile", "api/**">;
        type cases3 = [Expect<Equal<Test3, false>>];
    });

    test("精确匹配（无通配符）", () => {
        type Test1 = IsWildcardMatched<"users/login", "users/login">;
        type cases1 = [Expect<Equal<Test1, true>>];

        type Test2 = IsWildcardMatched<"users/login", "users/logout">;
        type cases2 = [Expect<Equal<Test2, false>>];
    });

    test("边界情况", () => {
        // 空路径
        type Test1 = IsWildcardMatched<"", "">;
        type cases1 = [Expect<Equal<Test1, true>>];

        type Test2 = IsWildcardMatched<"a", "">;
        type cases2 = [Expect<Equal<Test2, false>>];

        // 只有通配符
        type Test3 = IsWildcardMatched<"anything", "*">;
        type cases3 = [Expect<Equal<Test3, true>>];

        type Test4 = IsWildcardMatched<"a/b/c", "**">;
        type cases4 = [Expect<Equal<Test4, true>>];
    });
});
