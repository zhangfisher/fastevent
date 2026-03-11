/* eslint-disable no-unused-vars */

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { GetMatchedEventKeys } from "../../types/GetMatchedEventKeys";
import { GetRecommendEventKey } from "../../types/GetRecommendEventKey";
import { GetClosedEventDefine } from "../../types/wildcards/GetClosedEventDefine";
import { type GetClosedEvents } from "../../types/GetClosedEvents";
import { GetClosedEventKeys } from "../../types/GetClosedEventKeys";
import { UnionToTuple } from "type-fest";
import { GetPartCount } from "../../types/wildcards/GetPartCount";
import { GetWildcardCount } from "../../types/wildcards/GetWildcardCount";
import { FirstOfUnion } from "../../types";
import { ClosestMatch } from "../../types/ClosestMatch";

describe("GetClosedEvents - 精确匹配测试", () => {
    test("精确键匹配：无通配符", () => {
        type Events = {
            "user/login": { userId: number; username: string };
            "user/logout": { userId: number };
            "status/change": "active" | "inactive";
        };

        type Result1 = GetClosedEvents<Events, "user/login">;
        type Result2 = GetClosedEvents<Events, "user/logout">;
        type Result3 = GetClosedEvents<Events, "status/change">;

        type cases = [
            Expect<Equal<Result1, { "user/login": { userId: number; username: string } }>>,
            Expect<Equal<Result2, { "user/logout": { userId: number } }>>,
            Expect<Equal<Result3, { "status/change": "active" | "inactive" }>>,
        ];
    });

    test("无匹配键返回默认值", () => {
        type Events = {
            "user/login": { userId: number };
        };

        type Result1 = GetClosedEvents<Events, "invalid/event">;
        type Result2 = GetClosedEvents<Events, "invalid/event", { default: string }>;

        type cases = [
            Expect<Equal<Result1, Record<string, any>>>,
            Expect<Equal<Result2, { default: string }>>,
        ];
    });
});

describe("GetClosedEvents - 单级通配符 * 测试", () => {
    test("单级通配符匹配", () => {
        type Events = {
            "users/*/login": { userId: number };
            "users/*/profile": { username: string };
        };

        type Result1 = GetClosedEvents<Events, "users/123/login">;
        type Result2 = GetClosedEvents<Events, "users/456/profile">;
        type Result3 = GetClosedEvents<Events, "users/789/settings">;

        type cases = [
            Expect<Equal<Result1, { "users/*/login": { userId: number } }>>,
            Expect<Equal<Result2, { "users/*/profile": { username: string } }>>,
            Expect<Equal<Result3, Record<string, any>>>,
        ];
    });

    test("单级通配符优先级：精确键优先", () => {
        type Events = {
            "exact/key": { type: "exact" };
            "users/*/action": { type: "wild" };
        };

        type Result = GetClosedEvents<Events, "exact/key">;

        type cases = [Expect<Equal<Result, { "exact/key": { type: "exact" } }>>];
    });

    test("多个单级通配符：选择最精确的", () => {
        type Events = {
            "users/*/login": { one: number };
            "users/*/*/login": { two: string };
            "admin/*/*": { admin: boolean };
        };

        type Result = GetClosedEvents<Events, "users/123/login">;

        type cases = [Expect<Equal<Result, { "users/*/login": { one: number } }>>];
    });
});

describe("GetClosedEvents - 多级通配符 ** 测试", () => {
    test("多级通配符匹配深层路径", () => {
        type Events = {
            "user/**": { userId: number; action: string };
        };

        type Result1 = GetClosedEvents<Events, "user/profile">;
        type Result2 = GetClosedEvents<Events, "user/settings/privacy/update">;
        type Result3 = GetClosedEvents<Events, "user/a/b/c/d/e">;

        type cases = [
            Expect<Equal<Result1, { "user/**": { userId: number; action: string } }>>,
            Expect<Equal<Result2, { "user/**": { userId: number; action: string } }>>,
            Expect<Equal<Result3, { "user/**": { userId: number; action: string } }>>,
        ];
    });

    test("混合单级和多级通配符：选择最精确的", () => {
        type Events = {
            "user/profile/settings/advanced": { exact: true };
            "user/profile/**": { doubleWild: boolean };
            "user/*/settings": { singleWild: string };
        };

        type Result1 = GetClosedEvents<Events, "user/profile/settings/advanced">;
        type Result2 = GetClosedEvents<Events, "user/profile/other">;
        type Result3 = GetClosedEvents<Events, "user/test/settings">;

        type cases = [
            Expect<Equal<Result1, { "user/profile/settings/advanced": { exact: true } }>>,
            Expect<Equal<Result2, { "user/profile/**": { doubleWild: boolean } }>>,
            Expect<Equal<Result3, { "user/*/settings": { singleWild: string } }>>,
        ];
    });
});

describe("GetClosedEvents - 通配符数量优先级测试", () => {
    test("按通配符数量选择最精确的（1个通配符）", () => {
        type Events = {
            "admin/dashboard/users/**": { admin1: true };
            "admin/dashboard/**": { admin2: boolean };
            "admin/**": { admin3: string };
        };

        type Result = GetClosedEvents<Events, "admin/dashboard/users/list">;

        type Keys = GetClosedEventKeys<Events, "admin/dashboard/users/list">;
        type Key = GetRecommendEventKey<Events, "admin/dashboard/users/list">;
        type cases = [Expect<Equal<Result, { "admin/dashboard/users/**": { admin1: true } }>>];
    });

    test("按固定段数量选择（2个通配符情况）", () => {
        type Events = {
            "users/*/*": { value: 1 };
            "users/*/login": { value: 2 };
            "*/fisher/*": { value: 3 };
            "*/*/login": { value: 4 };
        };

        type Result = GetClosedEvents<Events, "users/fisher/login">;
        type ER1 = GetClosedEventKeys<Events, "users/fisher/login">;
        type ER2 = GetRecommendEventKey<Events, "users/fisher/login">;

        type ER22 = ClosestMatch<"users/*/login" | "users/*/*">;

        // "users/*/login" 和 "*/*/login" 都有1个通配符
        // 但 "users/*/login" 有更多固定段 (users, login)，所以优先级更高
        type cases = [Expect<Equal<Result, { "users/*/login": { value: 2 } }>>];
    });

    test("相同通配符数量：选择第一个匹配的", () => {
        type Events = {
            "a/*/c": { first: number };
            "a/*/d": { second: string };
        };

        type Result1 = GetClosedEvents<Events, "a/x/c">;
        type Result2 = GetClosedEvents<Events, "a/y/d">;

        type cases = [
            Expect<Equal<Result1, { "a/*/c": { first: number } }>>,
            Expect<Equal<Result2, { "a/*/d": { second: string } }>>,
        ];
    });
});

describe("GetClosedEvents - 复杂场景测试", () => {
    test("深层嵌套路径", () => {
        type Events = {
            "a/b/c/d/e": { deep: "exact" };
            "a/**": { deep: "wild" };
            "a/b/**": { deeper: "semi-wild" };
            "a/b/c/**": { deeper: "semi-wild" };
        };

        type Result1 = GetClosedEvents<Events, "a/b/c/d/e">;
        type Result2 = GetClosedEvents<Events, "a/x/y/z">;
        type Result3 = GetClosedEvents<Events, "a/b/x/y">;
        type Keys1 = GetClosedEventKeys<Events, "a/b/x/y">;
        type Keys2 = GetMatchedEventKeys<Events, "a/b/c/x/y">;
        type Keys21 = ClosestMatch<Keys2>;
        type dd = GetWildcardCount<"**">;
        type Keys3 = GetRecommendEventKey<Events, "a/b/x/y">;

        type cases = [
            Expect<Equal<Result1, { "a/b/c/d/e": { deep: "exact" } }>>,
            Expect<Equal<Result2, { "a/**": { deep: "wild" } }>>,
            Expect<Equal<Result3, { "a/b/**": { deeper: "semi-wild" } }>>,
        ];
    });

    test("复杂通配符组合", () => {
        type Events = {
            "*/*/login": { generic: string };
            "users/*/login": { specific: { userId: number } };
            "div/click/*": { click: boolean };
            "x/*/y/*": { nested: number };
        };

        type Result1 = GetClosedEvents<Events, "users/123/login">;
        type R1 = GetClosedEventKeys<Events, "users/123/login">;

        type Result2 = GetClosedEvents<Events, "admin/456/login">;
        type Result3 = GetClosedEvents<Events, "div/click/button">;
        type Result4 = GetClosedEvents<Events, "x/1/y/2">;
        type Define1 = GetClosedEventDefine<Result4, "x/1/y/2">;
        type cases = [
            Expect<Equal<Result1, { "users/*/login": { specific: { userId: number } } }>>,
            Expect<Equal<Result2, { "*/*/login": { generic: string } }>>,
            Expect<Equal<Result3, { "div/click/*": { click: boolean } }>>,
            Expect<Equal<Result4, { "x/*/y/*": { nested: number } }>>,
        ];
    });
});

describe("GetClosedEvents - 边界情况测试", () => {
    test("空事件对象", () => {
        type Events = {};

        type Result = GetClosedEvents<Events, "any/event">;

        type cases = [Expect<Equal<Result, Record<string, any>>>];
    });

    test("只有精确键，无通配符", () => {
        type Events = {
            "event/a": number;
            "event/b": string;
        };

        type Result1 = GetClosedEvents<Events, "event/a">;
        type Result2 = GetClosedEvents<Events, "event/c">;

        type cases = [
            Expect<Equal<Result1, { "event/a": number }>>,
            Expect<Equal<Result2, Record<string, any>>>,
        ];
    });

    test("只有通配符键", () => {
        type Events = {
            [x: `test/${string}`]: boolean;
        };

        type Result1 = GetClosedEvents<Events, "test/123">;
        type Result2 = GetClosedEvents<Events, "other/123">;

        type cases = [
            Expect<Equal<Result1, { [x: `test/${string}`]: boolean }>>,
            Expect<Equal<Result2, Record<string, any>>>,
        ];
    });

    test("单星号通配符", () => {
        type Events = {
            "*": { catchAll: true };
        };

        type Result1 = GetClosedEvents<Events, "anything">;
        type Result2 = GetClosedEvents<Events, "deep/nested/path">;

        type cases = [
            Expect<Equal<Result1, { "*": { catchAll: true } }>>,
            Expect<Equal<Result2, Record<string, any>>>,
        ];
    });
});

describe("GetClosedEvents - 复杂类型 payload 测试", () => {
    test("联合类型 payload", () => {
        type Events = {
            "event/union": string | number | boolean;
        };

        type Result = GetClosedEvents<Events, "event/union">;

        type cases = [Expect<Equal<Result, { "event/union": string | number | boolean }>>];
    });

    test("数组类型 payload", () => {
        type Events = {
            "event/array": number[];
            "event/tuple": [string, number];
        };

        type Result1 = GetClosedEvents<Events, "event/array">;
        type Result2 = GetClosedEvents<Events, "event/tuple">;

        type cases = [
            Expect<Equal<Result1, { "event/array": number[] }>>,
            Expect<Equal<Result2, { "event/tuple": [string, number] }>>,
        ];
    });

    test("函数类型 payload", () => {
        type Events = {
            "event/function": (data: string) => void;
        };

        type Result = GetClosedEvents<Events, "event/function">;

        type cases = [Expect<Equal<Result, { "event/function": (data: string) => void }>>];
    });

    test("嵌套对象类型 payload", () => {
        type Events = {
            "user/create": {
                user: {
                    id: number;
                    profile: {
                        name: string;
                        email: string;
                    };
                };
                timestamp: number;
            };
        };

        type Result = GetClosedEvents<Events, "user/create">;

        type cases = [
            Expect<
                Equal<
                    Result,
                    {
                        "user/create": {
                            user: {
                                id: number;
                                profile: {
                                    name: string;
                                    email: string;
                                };
                            };
                            timestamp: number;
                        };
                    }
                >
            >,
        ];
    });
});

describe("GetClosedEvents - 默认值测试", () => {
    test("自定义默认值类型", () => {
        type Events = {
            "existing/event": string;
        };

        type Result1 = GetClosedEvents<Events, "existing/event", { fallback: number }>;
        type Result2 = GetClosedEvents<Events, "non/existing", { fallback: number }>;

        type cases = [
            Expect<Equal<Result1, { "existing/event": string }>>,
            Expect<Equal<Result2, { fallback: number }>>,
        ];
    });

    test("默认值为空对象", () => {
        type Events = {
            "some/event": boolean;
        };

        type Result = GetClosedEvents<Events, "other/event", {}>;

        type cases = [Expect<Equal<Result, {}>>];
    });

    test("默认值为复杂类型", () => {
        type Events = {};

        type DefaultType = {
            error: { code: number; message: string };
            timestamp: number;
        };

        type Result = GetClosedEvents<Events, "any/event", DefaultType>;

        type cases = [
            Expect<
                Equal<
                    Result,
                    {
                        error: { code: number; message: string };
                        timestamp: number;
                    }
                >
            >,
        ];
    });
});
