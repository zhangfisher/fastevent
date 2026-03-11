import { describe, test } from "vitest";
import { expectTypeOf } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import type { GetMatchedEvents } from "../../types";
import type { GetMatchedEventPayload } from "../../types/transformed/GetMatchedEventPayload";

describe("GetMatchedEvents - 交集类型修复验证", () => {
    test("多个匹配应该返回交集类型，键的值类型保持独立", () => {
        type ExtEvents = {
            [x: `users/${string}/login`]: string;
        } & {
            [x: `users/${string}/${string}`]: {
                name: string;
                vip: boolean;
            };
        };

        type Result = GetMatchedEvents<ExtEvents, "users/x/login">;

        // 验证返回的是交集类型
        type cases = [
            Expect<
                Equal<
                    Result,
                    {
                        [x: `users/${string}/login`]: string;
                    } & {
                        [x: `users/${string}/${string}`]: {
                            name: string;
                            vip: boolean;
                        };
                    }
                >
            >,
        ];
    });

    test("GetMatchedEventPayload 应该返回联合类型", () => {
        type ExtEvents = {
            [x: `users/${string}/login`]: string;
        } & {
            [x: `users/${string}/${string}`]: {
                name: string;
                vip: boolean;
            };
        };

        type Result = GetMatchedEventPayload<ExtEvents, "users/x/login">;

        // payload 应该是联合类型
        type cases = [Expect<Equal<Result, string | { name: string; vip: boolean }>>];
    });

    test("单个匹配应该正常工作", () => {
        type Events = {
            click: { x: number; y: number };
        };

        type Result = GetMatchedEvents<Events, "click">;

        type cases = [Expect<Equal<Result, { click: { x: number; y: number } }>>];
    });

    test("通配符匹配应该正常工作", () => {
        type Events = {
            [x: `users/${string}/profile`]: { id: string };
        };

        type Result = GetMatchedEvents<Events, "users/john/profile">;

        type cases = [Expect<Equal<Result, { [x: `users/${string}/profile`]: { id: string } }>>];
    });
});
