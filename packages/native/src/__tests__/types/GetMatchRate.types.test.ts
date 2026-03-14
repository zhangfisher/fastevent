// oxlint-disable no-unused-vars
import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import type { GetMatchRate } from "../../types/WildcardEvents";

describe("GetMatchRate 测试", () => {
    test("users/x/login 与 users/${string}/login 的匹配度应该是 2", () => {
        type Rate = GetMatchRate<"users/x/login", "users/${string}/login">;
        type cases = [Expect<Equal<Rate, 2>>];
    });

    test("users/x/login 与 users/${string}/${string} 的匹配度应该是 1", () => {
        type Rate = GetMatchRate<"users/x/login", "users/${string}/${string}">;
        type cases = [Expect<Equal<Rate, 1>>];
    });

    test("完全匹配的路径匹配度应该是 3", () => {
        type Rate = GetMatchRate<"users/x/login", "users/x/login">;
        type cases = [Expect<Equal<Rate, 3>>];
    });

    test("完全不匹配的路径匹配度应该是 0", () => {
        type Rate = GetMatchRate<"users/x/login", "posts/a/b">;
        type cases = [Expect<Equal<Rate, 0>>];
    });

    test("包含 * 通配符的路径匹配度", () => {
        type Rate = GetMatchRate<"users/x/login", "users/*/login">;
        type cases = [Expect<Equal<Rate, 2>>];
    });

    test("包含 ** 通配符的路径匹配度", () => {
        type Rate = GetMatchRate<"users/x/profile/settings", "users/**">;
        type cases = [Expect<Equal<Rate, 1>>];
    });
});
