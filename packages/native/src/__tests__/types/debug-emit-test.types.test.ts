/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../../event";
import { GetPayload } from "../../types";
import { GetClosestEvents } from "../../types/closest/GetClosestEvents";
import { GetClosestEventTuple } from "../../types/closest/GetClosestEventRecord";
import { GetClosestEventName } from "../../types/closest/GetClosestEventName";
import { GetMatchedEventNames } from "../../types/closest/GetMatchedEventNames";
import { IsWildcardMatched } from "../../types/WildcardEvents";

describe("调试 emit 类型推断", () => {
    test("分析 GetPayload 的类型推断", () => {
        interface Events {
            "users/*/login": "x" | "y" | "z";
        }

        // 测试 1: 直接使用 GetPayload
        type Payload1 = GetPayload<Events, "users/assss/login">;
        // 预期: "x" | "y" | "z"

        // 测试 2: GetClosestEventName
        type ClosestName = GetClosestEventName<Events, "users/assss/login">;
        // 预期: "users/*/login"

        // 测试 3: GetClosestEventTuple
        type ClosestTuple = GetClosestEventTuple<Events, "users/assss/login">;
        // 预期: ["users/*/login", "x" | "y" | "z"]

        // 测试 4: GetClosestEvents
        type ClosestEvents = GetClosestEvents<Events, "users/assss/login">;
        // 预期: { "users/*/login": "x" | "y" | "z" }

        // 测试 5: IsWildcardMatched
        type IsMatched = IsWildcardMatched<"users/assss/login", "users/*/login">;
        // 预期: true

        // 测试 6: GetMatchedEventNames
        type MatchedNames = GetMatchedEventNames<Events, "users/assss/login">;
        // 预期: { 1: "users/*/login" }

        // 验证类型
        type cases = [
            Expect<Equal<Payload1, "x" | "y" | "z">>,
            Expect<Equal<ClosestName, "users/*/login">>,
            Expect<Equal<ClosestTuple, ["users/*/login", "x" | "y" | "z"]>>,
            Expect<Equal<ClosestEvents, { "users/*/login": "x" | "y" | "z" }>>,
            Expect<Equal<IsMatched, true>>,
            Expect<Equal<MatchedNames, { 1: "users/*/login" }>>,
        ];
    });

    test("实际 emit 调用的类型检查", () => {
        interface Events {
            "users/*/login": "x" | "y" | "z";
        }
        const emitter = new FastEvent<Events>();

        // 这些应该报错，但实际上可能没有
        emitter.emit("users/assss/login", 1);  // number 类型，应该报错
        emitter.emit("users/assss/login", ""); // 空字符串，应该报错

        // 这些应该是正确的
        emitter.emit("users/assss/login", "x");  // ✅
        emitter.emit("users/assss/login", "y");  // ✅
        emitter.emit("users/assss/login", "z");  // ✅
    });
});
