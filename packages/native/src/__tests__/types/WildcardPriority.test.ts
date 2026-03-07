/* eslint-disable no-unused-vars */

import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { CountFixedSegments, IsSemiWildcard, IsFullWildcard } from "../../types/WildcardPriority";
import { GetClosestEvents } from "../../types/WildcardEvents";

describe("WildcardPriority", () => {
    describe("SplitPath - 路径分割基础测试", () => {
        test("正确处理没有 / 的情况", () => {
            // 内部实现测试，验证 SplitPath 的边缘情况处理
            type cases = [
                // 单个段（没有 /）
                Expect<Equal<CountFixedSegments<"click">, 1>>,
                Expect<Equal<CountFixedSegments<"event">, 1>>,

                // 独立通配符段（没有 /）
                Expect<Equal<CountFixedSegments<"*">, 0>>,
                Expect<Equal<CountFixedSegments<"**">, 0>>,

                // 带有 / 的多段路径
                Expect<Equal<CountFixedSegments<"a/b">, 2>>,
                Expect<Equal<CountFixedSegments<"a/b/c">, 3>>,
            ];
        });
    });

    describe("CountFixedSegments - 计算固定段数量", () => {
        test("半通配符有固定段", () => {
            type cases = [
                Expect<Equal<CountFixedSegments<"rooms/*/$join">, 2>>,
                Expect<Equal<CountFixedSegments<"rooms/*/$leave">, 2>>,
                Expect<Equal<CountFixedSegments<"api/*/users">, 2>>,
                // data/v*/detail 中的 v* 不是独立的通配符段，所以是固定段
                Expect<Equal<CountFixedSegments<"data/v*/detail">, 3>>,
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
                // data/v*/detail 中的 v* 不是独立的通配符段
                Expect<Equal<CountFixedSegments<"data/v*/detail">, 3>>,
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
                // data/v*/detail 中的 v* 不是独立的通配符段，所以不是半通配符
                Expect<Equal<IsSemiWildcard<"data/v*/detail">, false>>,
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

describe("ClosestWildcardEvents - 最接近匹配事件类型", () => {
    describe("基础优先级测试 - 固定段多的优先", () => {
        test("users/*/login vs users/*/* - 应该选择固定段多的", () => {
            interface Events {
                "users/*/login": string;
                "users/*/*": { name: string; vip: boolean };
            }

            // users/*/login: 2个固定段 → 高优先级
            // users/*/*: 1个固定段 → 低优先级
            type Result1 = GetClosestEvents<Events, "users/fisher/login">;
            type Result2 = GetClosestEvents<Events, "users/admin/logout">;

            type cases = [
                Expect<Equal<Result1, { "users/*/login": string }>>,
                Expect<Equal<Result2, { "users/*/*": { name: string; vip: boolean } }>>,
            ];
        });

        test("多个层级通配符优先级", () => {
            interface Events {
                "a/b/c": number;
                "a/*/c": string;
                "a/*/*": boolean;
            }

            type Result1 = GetClosestEvents<Events, "a/b/c">;
            type Result2 = GetClosestEvents<Events, "a/x/c">;
            type Result3 = GetClosestEvents<Events, "a/x/y">;

            type cases = [
                Expect<Equal<Result1, { "a/b/c": number }>>, // 精确匹配
                Expect<Equal<Result2, { "a/*/c": string }>>, // 1个通配符，2个固定段
                Expect<Equal<Result3, { "a/*/*": boolean }>>, // 2个通配符，1个固定段
            ];
        });
    });

    describe("精确匹配优先级最高", () => {
        test("存在精确匹配时应该选择精确匹配", () => {
            interface Events {
                "users/fisher/login": { exact: boolean };
                "users/*/login": string;
                "users/*/*": { name: string; vip: boolean };
            }

            type Result = GetClosestEvents<Events, "users/fisher/login">;

            type cases = [Expect<Equal<Result, { "users/fisher/login": { exact: boolean } }>>];
        });

        test("只有通配符匹配时选择最精确的通配符", () => {
            interface Events {
                "rooms/*/lobby/$join": { room: string; welcome: string; users: string[] };
                "rooms/*/*/$join": { room: string; message: string };
                "rooms/*/*/*": number;
            }

            type Result1 = GetClosestEvents<Events, "rooms/123/lobby/$join">;
            type Result2 = GetClosestEvents<Events, "rooms/456/game/$join">;
            type Result3 = GetClosestEvents<Events, "rooms/789/any/other">;

            type cases = [
                Expect<
                    Equal<
                        Result1,
                        {
                            "rooms/*/lobby/$join": {
                                room: string;
                                welcome: string;
                                users: string[];
                            };
                        }
                    >
                >,
                Expect<Equal<Result2, { "rooms/*/*/$join": { room: string; message: string } }>>,
                Expect<Equal<Result3, { "rooms/*/*/*": number }>>,
            ];
        });
    });

    describe("边缘情况测试", () => {
        test("全通配符优先级最低", () => {
            interface Events {
                "a/b/c": number;
                "*": string;
                "**": boolean;
            }

            type Result = GetClosestEvents<Events, "a/b/c">;

            type cases = [Expect<Equal<Result, { "a/b/c": number }>>];
        });

        test("混合通配符和固定段", () => {
            interface Events {
                "api/*/users": number;
                "api/v1/users": string;
                "api/*/*": boolean;
            }

            type Result1 = GetClosestEvents<Events, "api/v1/users">;
            type Result2 = GetClosestEvents<Events, "api/v2/users">;
            type Result3 = GetClosestEvents<Events, "api/v1/posts">;

            type cases = [
                Expect<Equal<Result1, { "api/v1/users": string }>>, // 精确匹配
                Expect<Equal<Result2, { "api/*/users": number }>>, // 1个通配符，2个固定段
                Expect<Equal<Result3, { "api/*/*": boolean }>>, // 2个通配符，1个固定段
            ];
        });

        test("相同固定段数量时的处理", () => {
            interface Events {
                "a/*/b": string;
                "a/b/*": number;
            }

            // 两者都有2个固定段，应该选择第一个（TypeScript 键顺序）
            type Result1 = GetClosestEvents<Events, "a/x/b">;
            type Result2 = GetClosestEvents<Events, "a/b/y">;

            type cases = [
                Expect<Equal<Result1, { "a/*/b": string }>>,
                Expect<Equal<Result2, { "a/b/*": number }>>,
            ];
        });
    });

    describe("复杂场景测试", () => {
        test("多层级嵌套通配符", () => {
            interface Events {
                "rooms/*/lobby/$join": { room: string; welcome: string };
                "rooms/*/*/status": { room: string; status: string };
                "rooms/*/*/*": number;
                "**": boolean;
            }

            type Result1 = GetClosestEvents<Events, "rooms/123/lobby/$join">;
            type Result2 = GetClosestEvents<Events, "rooms/456/game/status">;
            type Result3 = GetClosestEvents<Events, "rooms/789/any/other">;

            type cases = [
                Expect<
                    Equal<Result1, { "rooms/*/lobby/$join": { room: string; welcome: string } }>
                >,
                Expect<Equal<Result2, { "rooms/*/*/status": { room: string; status: string } }>>,
                Expect<Equal<Result3, { "rooms/*/*/*": number }>>,
            ];
        });

        test("不同类型的通配符组合", () => {
            interface Events {
                "users/*/profile/settings": string;
                "users/*/profile/*": number;
                "users/*/*/*": boolean;
            }

            type Result1 = GetClosestEvents<Events, "users/john/profile/settings">;
            type Result2 = GetClosestEvents<Events, "users/jane/profile/photo">;
            type Result3 = GetClosestEvents<Events, "users/bob/data/extra">;

            type cases = [
                Expect<Equal<Result1, { "users/*/profile/settings": string }>>,
                Expect<Equal<Result2, { "users/*/profile/*": number }>>,
                Expect<Equal<Result3, { "users/*/*/*": boolean }>>,
            ];
        });
    });

    describe("向后兼容性测试", () => {
        test("与原有 GetMatchedEvents 行为一致", () => {
            interface Events {
                a: boolean;
                b: number;
                c: string;
                "div/*/click": { x: number; y: number };
                "users/*/login": string;
                "users/*/logout": string;
                "users/*/*": { name: string; vip: boolean };
            }

            type Result1 = GetClosestEvents<Events, "users/fisher/login">;
            type Result2 = GetClosestEvents<Events, "users/admin/logout">;

            type cases = [
                Expect<Equal<Result1, { "users/*/login": string }>>,
                Expect<Equal<Result2, { "users/*/logout": string }>>,
            ];
        });

        test("支持双星通配符", () => {
            interface Events {
                "rooms/**": boolean;
                "rooms/*/lobby": string;
                "rooms/lobby/*": number;
            }

            type Result1 = GetClosestEvents<Events, "rooms/a/b/c">;
            type Result2 = GetClosestEvents<Events, "rooms/123/lobby">;
            type Result3 = GetClosestEvents<Events, "rooms/lobby/x">;

            type cases = [
                Expect<Equal<Result1, { "rooms/**": boolean }>>,
                Expect<Equal<Result2, { "rooms/*/lobby": string }>>,
                Expect<Equal<Result3, { "rooms/lobby/*": number }>>,
            ];
        });
    });
});
