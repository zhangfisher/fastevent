// oxlint-disable no-unused-expressions
/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { IsTransformedKey, IsAny, ExtendWildcardEvents } from "../../types";
import { AssertFastMessage as NotPayload } from "../../types";

describe("IsAny", () => {
    test("正确识别 any 类型", () => {
        type Test1 = IsAny<any>;
        type cases1 = [Expect<Equal<Test1, true>>];

        type Test2 = IsAny<string>;
        type cases2 = [Expect<Equal<Test2, false>>];

        type Test3 = IsAny<unknown>;
        type cases3 = [Expect<Equal<Test3, false>>];

        type Test4 = IsAny<never>;
        type cases4 = [Expect<Equal<Test4, false>>];

        type Test5 = IsAny<number>;
        type cases5 = [Expect<Equal<Test5, false>>];

        type Test6 = IsAny<boolean>;
        type cases6 = [Expect<Equal<Test6, false>>];

        type Test7 = IsAny<object>;
        type cases7 = [Expect<Equal<Test7, false>>];
    });
});

describe("IsTransformedKey", () => {
    test("正确处理 any 类型", () => {
        // any 不应该被视为 FastMessagePayload
        type dd = IsTransformedKey<Record<string, any>, "test">;
        type cases = [Expect<Equal<dd, never>>];
    });

    test("明确标记的 NotPayload 事件应该被识别", () => {
        type Events1 = {
            test: NotPayload<string>;
        };
        type result1 = IsTransformedKey<Events1, "test">;
        type cases1 = [Expect<Equal<result1, "test">>];
    });

    test("普通类型不应该被识别为转换事件", () => {
        type Events2 = {
            test: string;
        };
        type result2 = IsTransformedKey<Events2, "test">;
        type cases2 = [Expect<Equal<result2, never>>];
    });

    test("通配符 + any 的组合应该返回 never", () => {
        type Events3 = {
            "*": any;
        };
        type result3 = IsTransformedKey<Events3, "test">;
        type cases3 = [Expect<Equal<result3, never>>];
    });

    test("通配符 + NotPayload 应该被识别", () => {
        type Events4 = ExtendWildcardEvents<{
            "*": NotPayload<string>;
        }>;
        type result4 = IsTransformedKey<Events4, "test">;
        type cases4 = [Expect<Equal<result4, "test">>];
    });

    test("混合事件类型测试", () => {
        type Events5 = {
            click: NotPayload<{ x: number; y: number }>;
            mousemove: boolean;
            scroll: number;
        };

        // NotPayload 事件应该被识别
        type result5a = IsTransformedKey<Events5, "click">;
        type cases5a = [Expect<Equal<result5a, "click">>];

        // 普通事件不应该被识别
        type result5b = IsTransformedKey<Events5, "mousemove">;
        type cases5b = [Expect<Equal<result5b, never>>];

        type result5c = IsTransformedKey<Events5, "scroll">;
        type cases5c = [Expect<Equal<result5c, never>>];
    });

    test("不存在的键应该返回 never", () => {
        type Events6 = {
            existing: string;
        };
        type result6 = IsTransformedKey<Events6, "nonexistent">;
        type cases6 = [Expect<Equal<result6, never>>];
    });
    test("通配符中不存在的键应该返回 never", () => {
        type Events = {
            "users/*/online": string;
            "users/*/offline": boolean;
            "post/*": number;
            a: boolean;
        };
        type result6 = IsTransformedKey<Events, "users/fisher/online">;
        type cases6 = [Expect<Equal<result6, never>>];
    });
    test("通配符中匹配时", () => {
        type Events = ExtendWildcardEvents<{
            "users/*/online": NotPayload<string>;
            "users/*/offline": boolean;
            "post/*": number;
            a: boolean;
        }>;
        type result6 = IsTransformedKey<Events, "users/fisher/online">;
        type cases6 = [Expect<Equal<result6, "users/fisher/online">>];
    });
});
