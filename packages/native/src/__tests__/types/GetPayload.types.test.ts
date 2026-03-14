/* eslint-disable no-unused-vars */

import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { type FastMessagePayload } from "../../types/FastEventMessages";
import { type GetPayload } from "../../types/transformed/GetPayload";

describe("GetPayload - 基本功能测试", () => {
    test("精确键匹配：提取简单类型 payload", () => {
        type Events = {
            "user/login": { userId: number; username: string };
            "user/logout": { userId: number };
            "status/change": "active" | "inactive";
        };

        type Result1 = GetPayload<Events, "user/login">;
        type Result2 = GetPayload<Events, "user/logout">;
        type Result3 = GetPayload<Events, "status/change">;

        type cases = [
            Expect<Equal<Result1, { userId: number; username: string }>>,
            Expect<Equal<Result2, { userId: number }>>,
            Expect<Equal<Result3, "active" | "inactive">>,
        ];
    });

    test("无匹配键返回 never", () => {
        type Events = {
            "user/login": { userId: number };
        };

        type Result = GetPayload<Events, "invalid/event">;

        type cases = [Expect<Equal<Result, any>>];
    });
});

describe("GetPayload - 通配符匹配测试", () => {
    test("单级通配符 * 匹配", () => {
        type Events = {
            [x: `user/${string}`]: { id: number; name: string };
            [x: `admin/${string}`]: { adminId: number };
        };

        type Result1 = GetPayload<Events, "user/profile">;
        type Result2 = GetPayload<Events, "admin/settings">;

        type cases = [
            Expect<Equal<Result1, { id: number; name: string }>>,
            Expect<Equal<Result2, { adminId: number }>>,
        ];
    });

    test("多级通配符 ** 匹配", () => {
        type Events = {
            "user/**": { userId: number; action: string };
        };

        type Result1 = GetPayload<Events, "user/profile">;
        type Result2 = GetPayload<Events, "user/settings/privacy/update">;

        type cases = [
            Expect<Equal<Result1, { userId: number; action: string }>>,
            Expect<Equal<Result2, { userId: number; action: string }>>,
        ];
    });
});

describe("GetPayload - 优先级测试", () => {
    test("精确键优先于通配符", () => {
        type Events = {
            "exact/key": { type: "exact" };
            [x: `${string}/*`]: { type: "wild" };
        };

        type Result = GetPayload<Events, "exact/key">;

        type cases = [Expect<Equal<Result, { type: "exact" }>>];
    });

    test("多级通配符优先级", () => {
        type Events = {
            "user/profile/settings/advanced": { type: "exact" };
            "user/profile/**": { type: "double-wild" };
            [x: `user/${string}/*`]: { type: "single-wild" };
        };

        type Result1 = GetPayload<Events, "user/profile/settings/advanced">;
        type Result2 = GetPayload<Events, "user/profile/other">;

        type cases = [Expect<Equal<Result1, { type: "exact" }>>];
    });
});

describe("GetPayload - FastMessagePayload 处理", () => {
    test("提取 FastMessagePayload 中的类型", () => {
        type Events = {
            "event/1": FastMessagePayload<string>;
            "event/2": FastMessagePayload<number>;
            "event/3": FastMessagePayload<{ data: boolean }>;
        };

        type Result1 = GetPayload<Events, "event/1">;
        type Result2 = GetPayload<Events, "event/2">;
        type Result3 = GetPayload<Events, "event/3">;

        type cases = [
            Expect<Equal<Result1, FastMessagePayload<string>>>,
            Expect<Equal<Result2, FastMessagePayload<number>>>,
            Expect<Equal<Result3, FastMessagePayload<{ data: boolean }>>>,
        ];
    });

    test("混合 FastMessagePayload 和普通类型", () => {
        type Events = {
            transformed: FastMessagePayload<{ raw: string }>;
            normal: { normal: number };
        };

        type Result1 = GetPayload<Events, "transformed">;
        type Result2 = GetPayload<Events, "normal">;

        type cases = [
            Expect<Equal<Result1, FastMessagePayload<{ raw: string }>>>,
            Expect<Equal<Result2, { normal: number }>>,
        ];
    });
});

describe("GetPayload - 边界情况测试", () => {
    test("空事件对象", () => {
        type Events = {};

        type Result = GetPayload<Events, "any/event">;

        type cases = [Expect<Equal<Result, any>>];
    });

    test("只有精确键，无通配符", () => {
        type Events = {
            "event/a": number;
            "event/b": string;
        };

        type Result1 = GetPayload<Events, "event/a">;
        type Result2 = GetPayload<Events, "event/c">;

        type cases = [Expect<Equal<Result1, number>>, Expect<Equal<Result2, any>>];
    });

    test("只有通配符键", () => {
        type Events = {
            [x: `test/${string}`]: boolean;
        };

        type Result1 = GetPayload<Events, "test/123">;
        type Result2 = GetPayload<Events, "other/123">;

        type cases = [Expect<Equal<Result1, boolean>>, Expect<Equal<Result2, any>>];
    });

    test("复杂嵌套路径", () => {
        type Events = {
            "a/b/c/d/e": { deep: "exact" };
            "a/**": { deep: "wild" };
        };

        type Result1 = GetPayload<Events, "a/b/c/d/e">;
        type Result2 = GetPayload<Events, "a/x/y/z">;

        type cases = [
            Expect<Equal<Result1, { deep: "exact" }>>,
            Expect<Equal<Result2, { deep: "wild" }>>,
        ];
    });
});

describe("GetPayload - 联合类型和复杂结构", () => {
    test("联合类型 payload", () => {
        type Events = {
            "event/union": string | number | boolean;
        };

        type Result = GetPayload<Events, "event/union">;

        type cases = [Expect<Equal<Result, string | number | boolean>>];
    });

    test("数组类型 payload", () => {
        type Events = {
            "event/array": number[];
            "event/tuple": [string, number];
        };

        type Result1 = GetPayload<Events, "event/array">;
        type Result2 = GetPayload<Events, "event/tuple">;

        type cases = [Expect<Equal<Result1, number[]>>, Expect<Equal<Result2, [string, number]>>];
    });

    test("函数类型 payload", () => {
        type Events = {
            "event/function": (data: string) => void;
        };

        type Result = GetPayload<Events, "event/function">;

        type cases = [Expect<Equal<Result, (data: string) => void>>];
    });
});

describe("GetPayload - 固定段数量优先级", () => {
    test("不同固定段数量的通配符", () => {
        type Events = {
            "admin/dashboard/users/**": { admin: true };
            "admin/dashboard/**": { dashboard: true };
            "admin/**": { adminArea: true };
        };

        type Result1 = GetPayload<Events, "admin/dashboard/users/list">;
        type Result2 = GetPayload<Events, "admin/dashboard/settings">;
        type Result3 = GetPayload<Events, "admin/other">;

        type cases = [
            Expect<Equal<Result1, { admin: true }>>,
            Expect<Equal<Result2, { dashboard: true }>>,
            Expect<Equal<Result3, { adminArea: true }>>,
        ];
    });
});
