/* eslint-disable no-unused-vars */

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import {
    CountFixedSegments,
    IsSemiWildcard,
    IsFullWildcard,
} from "../../types/WildcardPriority";

describe("WildcardPriority", () => {
    describe("CountFixedSegments - 计算固定段数量", () => {
        test("半通配符有固定段", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"rooms/*/$join">, 2>>,
                Expect<Equal<CountFixedSegments<"rooms/*/$leave">, 2>>,
                Expect<Equal<CountFixedSegments<"api/*/users">, 2>>,
                Expect<Equal<CountFixedSegments<"data/v*/detail">, 2>>,
                Expect<Equal<CountFixedSegments<"rooms/*">, 1>>,
            ];
        });

        test("全通配符没有固定段", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"*">, 0>>,
                Expect<Equal<CountFixedSegments<"**">, 0>>,
                Expect<Equal<CountFixedSegments<"*/**">, 0>>,
                Expect<Equal<CountFixedSegments<"*/*">, 0>>,
                Expect<Equal<CountFixedSegments<"rooms/*/*">, 1>>,
            ];
        });

        test("精确路径全是固定段", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"user/login">, 2>>,
                Expect<Equal<CountFixedSegments<"click">, 1>>,
                Expect<Equal<CountFixedSegments<"rooms/lobby/join">, 3>>,
                Expect<Equal<CountFixedSegments<"api/v1/users">, 3>>,
            ];
        });

        test("复杂路径混合通配符", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"a/*/b/*/c">, 3>>,
                Expect<Equal<CountFixedSegments<"x/*/y/*/z/*">, 3>>,
                Expect<Equal<CountFixedSegments<"*/a/*">, 1>>,
            ];
        });

        test("通配符在不同位置", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"*/events">, 1>>,
                Expect<Equal<CountFixedSegments<"api/*/users">, 2>>,
                Expect<Equal<CountFixedSegments<"data/v*/detail">, 2>>,
                Expect<Equal<CountFixedSegments<"rooms/*">, 1>>,
            ];
        });
    });

    describe("IsSemiWildcard - 识别半通配符", () => {
        test("应该识别为半通配符", () => {
            type cases = [
                Expect<Equal<IsSemiWildcard<"rooms/*/$join">, true>>,
                Expect<Equal<IsSemiWildcard<"rooms/*/$leave">, true>>,
                Expect<Equal<IsSemiWildcard<"api/*/users">, true>>,
                Expect<Equal<IsSemiWildcard<"data/v*/detail">, true>>,
                Expect<Equal<IsSemiWildcard<"*/events">, true>>,
                Expect<Equal<IsSemiWildcard<"rooms/*">, true>>,
                Expect<Equal<IsSemiWildcard<"rooms/*/*">, true>>,
            ];
        });

        test("不应该识别为半通配符", () => {
            type cases = [
                Expect<Equal<IsSemiWildcard<"*">, false>>,
                Expect<Equal<IsSemiWildcard<"**">, false>>,
                Expect<Equal<IsSemiWildcard<"*/**">, false>>,
                Expect<Equal<IsSemiWildcard<"user/login">, false>>,
                Expect<Equal<IsSemiWildcard<"click">, false>>,
                Expect<Equal<IsSemiWildcard<"rooms/lobby/join">, false>>,
            ];
        });

        test("边缘情况", () => {
            type cases = [
                Expect<Equal<IsSemiWildcard<"">, false>>,
                Expect<Equal<IsSemiWildcard<"/">, false>>,
            ];
        });
    });

    describe("IsFullWildcard - 识别全通配符", () => {
        test("应该识别为全通配符", () => {
            type cases = [
                Expect<Equal<IsFullWildcard<"*">, true>>,
                Expect<Equal<IsFullWildcard<"**">, true>>,
                Expect<Equal<IsFullWildcard<"*/**">, true>>,
                Expect<Equal<IsFullWildcard<"*/*">, true>>,
                Expect<Equal<IsFullWildcard<"rooms/*">, true>>,
            ];
        });

        test("不应该识别为全通配符", () => {
            type cases = [
                Expect<Equal<IsFullWildcard<"rooms/*/$join">, false>>,
                Expect<Equal<IsFullWildcard<"api/*/users">, false>>,
                Expect<Equal<IsFullWildcard<"data/v*/detail">, false>>,
                Expect<Equal<IsFullWildcard<"*/events">, false>>,
                Expect<Equal<IsFullWildcard<"user/login">, false>>,
                Expect<Equal<IsFullWildcard<"click">, false>>,
                Expect<Equal<IsFullWildcard<"rooms/lobby/join">, false>>,
                Expect<Equal<IsFullWildcard<"rooms/*/*">, false>>,
            ];
        });

        test("边缘情况", () => {
            type cases = [
                Expect<Equal<IsFullWildcard<"">, false>>,
                Expect<Equal<IsFullWildcard<"/">, false>>,
            ];
        });
    });

    describe("优先级计算综合测试", () => {
        test("rooms/*/$join vs rooms/*/*", () => {
            // rooms/*/$join: 2 个固定段 → 半通配符，高优先级
            // rooms/*/*: 1 个固定段 → 半通配符，低优先级
            type JoinSegments = CountFixedSegments<"rooms/*/$join">;
            type AllSegments = CountFixedSegments<"rooms/*/*">;
            type JoinIsSemi = IsSemiWildcard<"rooms/*/$join">;
            type AllIsSemi = IsSemiWildcard<"rooms/*/*">;

            type cases = [
                Expect<Equal<JoinSegments, 2>>,
                Expect<Equal<AllSegments, 1>>,
                Expect<Equal<JoinIsSemi, true>>,
                Expect<Equal<AllIsSemi, true>>,
            ];
        });

        test("不同层级通配符的固定段数", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"a">, 1>>,
                Expect<Equal<CountFixedSegments<"a/*">, 1>>,
                Expect<Equal<CountFixedSegments<"a/*/*">, 1>>,
                Expect<Equal<CountFixedSegments<"a/*/$x">, 2>>,
                Expect<Equal<CountFixedSegments<"a/$x/*">, 2>>,
                Expect<Equal<CountFixedSegments<"a/$x/$y">, 3>>,
            ];
        });

        test("复杂场景", () => {
            type cases = [
                // 中间通配符，两端固定
                Expect<Equal<CountFixedSegments<"api/*/users">, 2>>,
                Expect<Equal<IsSemiWildcard<"api/*/users">, true>>,

                // 开头通配符，结尾固定
                Expect<Equal<CountFixedSegments<"*/events">, 1>>,
                Expect<Equal<IsSemiWildcard<"*/events">, true>>,

                // 结尾通配符，开头固定
                Expect<Equal<CountFixedSegments<"rooms/*">, 1>>,
                Expect<Equal<IsFullWildcard<"rooms/*">, true>>,

                // 全通配符
                Expect<Equal<CountFixedSegments<"*">, 0>>,
                Expect<Equal<IsFullWildcard<"*">, true>>,
            ];
        });
    });
});
