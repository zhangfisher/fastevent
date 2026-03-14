/* eslint-disable no-unused-vars */

import { describe, test } from "bun:test";
import type { Equal, Expect } from "@type-challenges/utils";
import { type GetClosestEventPayload } from "../../types/closest/GetClosestEventPayload";

describe("GetClosestEventPayload - 独立交叉类型支持", () => {
    test("基本独立交叉类型：多个通配符匹配", () => {
        type UserScopeEvents = {
            "a/b": string;
        } & {
            [x: `${string}/login`]: string;
        } & {
            [x: `${string}/logout`]: number;
        } & {
            [x: `${string}/${string}`]: {
                name: string;
                vip: boolean;
            };
        };

        type Result = GetClosestEventPayload<UserScopeEvents, "fisher/login">;

        // 应该返回联合类型，而不是交叉类型
        type cases = [
            // 验证返回的是联合类型，包含两个匹配的类型
            Expect<Equal<Result, { name: string; vip: boolean }>>,
            // 验证不包含交叉类型
            Expect<Equal<Exclude<Result, string>, { name: string; vip: boolean }>>,
        ];
    });

    test("多个通配符模式匹配同一键", () => {
        type Events1 = {
            [x: `user/${string}`]: string;
        } & {
            [x: `user/${string}/profile`]: { id: number };
        } & {
            [x: `user/${string}/*`]: boolean;
        };
        type Events = {
            "user/*": string;
            "user/*/profile": { id: number };
            "user/*/*": boolean;
        };
        type Result = GetClosestEventPayload<Events, "user/123/profile">;

        // 三个模式都匹配
        type cases = [Expect<Equal<Result, { id: number }>>];
    });

    test("优先级：精确键覆盖通配符", () => {
        type Events = {
            "exact/key": { type: "exact" };
        } & {
            [x: `${string}/*`]: { type: "wild" };
        };

        type Result = GetClosestEventPayload<Events, "exact/key">;

        // 精确键应该优先
        type cases = [Expect<Equal<Result, { type: "exact" }>>];
    });

    test("无匹配键返回 never", () => {
        type Events = {
            [x: `user/*`]: string;
        };

        type Result = GetClosestEventPayload<Events, "invalid/key">;

        type cases = [Expect<Equal<Result, never>>];
    });

    test("复杂嵌套的独立交叉类型", () => {
        type Events = {
            "admin/dashboard/**": { data: any };
        } & {
            [x: `admin/${string}/settings`]: { config: string };
        } & {
            [x: `admin/${string}/*`]: boolean;
        } & {
            [x: `admin/${string}`]: string;
        };

        type Result1 = GetClosestEventPayload<Events, "admin/dashboard/settings">;
        type Result2 = GetClosestEventPayload<Events, "admin/users/settings">;

        type cases = [
            // dashboard/settings 匹配三个模式
            Expect<Equal<Result1, { data: any } | { config: string } | boolean>>,
            // users/settings 匹配两个模式
            Expect<Equal<Result2, { config: string } | boolean | string>>,
        ];
    });

    test("混合精确键和通配符键", () => {
        type Events = {
            "user/login": { method: "login" };
        } & {
            "user/logout": { method: "logout" };
        } & {
            [x: `user/${string}`]: string;
        };

        type Result1 = GetClosestEventPayload<Events, "user/login">;
        type Result2 = GetClosestEventPayload<Events, "user/profile">;

        type cases = [
            // 精确键优先
            Expect<Equal<Result1, { method: "login" }>>,
            // 通配符匹配
            Expect<Equal<Result2, string>>,
        ];
    });

    test("空对象和简单类型", () => {
        type Events = {} & {
            [x: `test/*`]: boolean;
        };

        type Result = GetClosestEventPayload<Events, "test/123">;

        type cases = [Expect<Equal<Result, boolean>>];
    });

    test("通配符在不同位置", () => {
        type Events = {
            [x: `*/click`]: { x: number; y: number };
        } & {
            [x: `*/user/${string}`]: { name: string };
        } & {
            [x: `api/v1/*`]: number;
        };

        type Result1 = GetClosestEventPayload<Events, "div/click">;
        type Result2 = GetClosestEventPayload<Events, "admin/user/profile">;
        type Result3 = GetClosestEventPayload<Events, "api/v1/users">;

        type cases = [
            Expect<Equal<Result1, { x: number; y: number }>>,
            Expect<Equal<Result2, { name: string }>>,
            Expect<Equal<Result3, number>>,
        ];
    });

    test("多个独立交叉部分，部分匹配", () => {
        type Events = {
            [x: `a/*`]: string;
        } & {
            [x: `b/*`]: number;
        } & {
            [x: `c/*`]: boolean;
        };

        type Result1 = GetClosestEventPayload<Events, "a/test">;
        type Result2 = GetClosestEventPayload<Events, "x/test">;

        type cases = [Expect<Equal<Result1, string>>, Expect<Equal<Result2, never>>];
    });
});
