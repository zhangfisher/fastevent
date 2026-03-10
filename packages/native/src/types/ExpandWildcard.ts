// oxlint-disable no-unused-vars
import { ValueOf } from "./../../../../node_modules/type-fest/source/value-of.d";
import { ToMessage } from "./ScopeEvents";
import { Expand, FirstObjectItem, FirstOfUnion, IsMultiWildcard } from "./utils";
import { UnionToTuple } from "type-fest";
import { IsWildcardMatched } from "./WildcardEvents";
import { GetPartCount, GetWildcardCount } from "./WildcardPriority";

// 判断是否包含通配符
type ContainsWildcard<T extends string> = T extends `${string}/*/${string}`
    ? true
    : T extends `${string}/*`
      ? true
      : T extends `*/${string}`
        ? true
        : T extends `*` | `**`
          ? true
          : T extends `${string}/**`
            ? true
            : false;

// 辅助类型：分割字符串为数组
type Split<
    S extends string,
    Delimiter extends string = "/",
> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 辅助类型：处理单个段，如果是 * 则替换为 ${string}
type ProcessSegment<S extends string> = S extends "*" ? `${string}` : S;

// 辅助类型：处理数组中的每一项
type ProcessSegments<Arr extends string[]> = Arr extends []
    ? []
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? [ProcessSegment<First>, ...ProcessSegments<Rest>]
      : [];

// 辅助类型：将数组合并为字符串
type Join<Arr extends string[], Delimiter extends string = "/"> = Arr extends []
    ? ""
    : Arr extends [infer First extends string]
      ? First
      : Arr extends [infer First extends string, ...infer Rest extends string[]]
        ? `${First}${Delimiter}${Join<Rest, Delimiter>}`
        : string;

// 将通配符替换为 ${string}
// 新思路：
// 1. 先处理 **（多级通配符）
// 2. 然后按 / 分割，对每一段检查，如果是 * 则替换为 ${string}
// 3. 最后合并回去
export type ReplaceWildcard<T extends string> = T extends `${infer Head}**${infer Rest}`
    ? `${ReplaceWildcard<Head>}${string}${ReplaceWildcard<Rest>}`
    : Join<ProcessSegments<Split<T>>>;

// 提取所有包含通配符的键
export type WildcardKeys<T> = {
    [K in keyof T]: K extends string ? (ContainsWildcard<K> extends true ? K : never) : never;
}[keyof T];

// 展开通配符键
export type ExpandWildcard<T extends Record<string, any>> = Expand<
    // 保留原始键值对
    {
        // 为每个通配符键创建映射类型
        [K in WildcardKeys<T> as ReplaceWildcard<K>]: T[K];
    } & {
        // 获取所有不属于 WildcardKeys<T> 的键
        [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
    }
>;
// ============================================================================
// GetWildcardEventList: 将通配符事件转换为对象列表类型（联合类型）
// ============================================================================

// 判断是否为单个 * 通配符（会匹配任意字符串）
type IsSingleStar<T extends string> = T extends "*" ? true : false;

// 将通配符键转换为对象类型
// 如果是单个 *，使用 string 作为键；否则使用模板字面量类型
type WildcardKeyToObject<K extends string, V> = K extends K
    ? IsSingleStar<K> extends true
        ? {
              [x: string]: V;
          }
        : {
              [P in ReplaceWildcard<K>]: V;
          }
    : never;

// 获取所有通配符键的对象类型联合
type _WildcardObjectsUnion<T extends Record<string, any>> = {
    [K in WildcardKeys<T>]: WildcardKeyToObject<K, T[K]>;
};
// 将联合类型转换为带数字索引的 Record 类型
// 注意：由于 TypeScript 类型系统的限制，无法可靠地自动为联合类型生成递增索引
// 这里返回联合类型，这是最可靠的实现
type WildcardEvents<T extends Record<string, any>> = {
    [K in WildcardKeys<T>]: ValueOf<WildcardKeyToObject<K, T[K]>>;
};

// 获取所有普通键的对象类型
// 将所有普通键合并到一个对象中
type NormalEvents<T extends Record<string, any>> = {
    [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
};

/**
 *
 * 输入原始事件类型定义
 *
 */
export type GetWildcardEventList<Events extends Record<string, any>> = {
    wildcard: WildcardEvents<Events>;
    normal: NormalEvents<Events>;
};

export type ToWildcardMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof Events]: {
        type: ReplaceWildcard<Exclude<K, number | symbol>>;
        payload: ValueOf<Events[K]>;
        meta?: Meta;
    };
}[keyof Events];

// 获取最相近的Key
type _GetClosedEventKeys<Events extends Record<string, any>, T extends string> = {
    [Key in Exclude<keyof Events, number | symbol> as IsWildcardMatched<T, Key> extends true
        ? IsMultiWildcard<Key> extends true
            ? GetPartCount<Key> extends 9
                ? 9
                : GetPartCount<Key> extends 8
                  ? 8
                  : GetPartCount<Key> extends 7
                    ? 7
                    : GetPartCount<Key> extends 6
                      ? 6
                      : GetPartCount<Key> extends 5
                        ? 5
                        : GetPartCount<Key> extends 4
                          ? 4
                          : GetPartCount<Key> extends 3
                            ? 3
                            : GetPartCount<Key> extends 2
                              ? 2
                              : 1
            : GetWildcardCount<Key> extends 0
              ? 0
              : GetWildcardCount<Key> extends 9
                ? 9
                : GetWildcardCount<Key> extends 8
                  ? 8
                  : GetWildcardCount<Key> extends 7
                    ? 7
                    : GetWildcardCount<Key> extends 6
                      ? 6
                      : GetWildcardCount<Key> extends 5
                        ? 5
                        : GetWildcardCount<Key> extends 4
                          ? 4
                          : GetWildcardCount<Key> extends 3
                            ? 3
                            : GetWildcardCount<Key> extends 2
                              ? 2
                              : GetWildcardCount<Key> extends 1
                                ? 1
                                : never
        : T extends Key
          ? 0
          : never]: FirstOfUnion<Key>;
};

type GetClosedEventKey<Events extends Record<string, any>, T extends string> =
    _GetClosedEventKeys<Events, T> extends never
        ? never
        : _GetClosedEventKeys<Events, T> extends { 0: infer V }
          ? V
          : _GetClosedEventKeys<Events, T> extends { 9: infer V }
            ? V
            : _GetClosedEventKeys<Events, T> extends { 8: infer V }
              ? V
              : _GetClosedEventKeys<Events, T> extends { 7: infer V }
                ? V
                : _GetClosedEventKeys<Events, T> extends { 6: infer V }
                  ? V
                  : _GetClosedEventKeys<Events, T> extends { 5: infer V }
                    ? V
                    : _GetClosedEventKeys<Events, T> extends { 4: infer V }
                      ? V
                      : _GetClosedEventKeys<Events, T> extends { 3: infer V }
                        ? V
                        : _GetClosedEventKeys<Events, T> extends { 2: infer V }
                          ? V
                          : _GetClosedEventKeys<Events, T> extends { 1: infer V }
                            ? V
                            : never;

type AssertString<T> = T extends string ? T : string;

export type GetClosedEvents<
    Events extends Record<string, any>,
    T extends string,
    D = Record<string, any>,
> =
    GetClosedEventKey<Events, T> extends never
        ? D
        : Record<
              AssertString<GetClosedEventKey<Events, T>>,
              Events[AssertString<GetClosedEventKey<Events, T>>]
          >;

// // 测试用例
type TestEvents = {
    a: string;
    "a/b/c": { a: 1; b: 2; c: 3 };
    "div/click/*": boolean;
    "x/*/y/*": number;
    "simple*test": string;
    "no/wildcard": string[];
    "users/*/login": number;
    "*/*/login": number;
    "users/*/*": { name: string; vip: boolean };
    "*/*/*/*": 1;
    "*": 2;
};
type w1 = GetWildcardCount<"aa*a/*">;
type w2 = GetWildcardCount<"aa*a/*/*">;
type TestList0 = WildcardEvents<TestEvents>;
type TestList110 = WildcardEvents<TestEvents>;
type TestList1 = NormalEvents<TestEvents>;
type TestList = GetWildcardEventList<TestEvents>;
type M1 = ToWildcardMessage<TestList0>;
type M2 = ToMessage<TestList1>;
type E1 = _GetClosedEventKeys<TestEvents, "users/fisher/login">;
type E2 = _GetClosedEventKeys<TestEvents, "a/b/c">;
type E3 = _GetClosedEventKeys<TestEvents, "a/b/c">;
type ER1 = GetClosedEventKey<TestEvents, "users/fisher/login">;
type ER2 = TestEvents[GetClosedEventKey<TestEvents, "users/fisher/login">];
type ER23 = GetClosedEvents<TestEvents, "users/fisher/login">;
type ER231 = GetClosedEvents<TestEvents, "users/fisher/login">;
type ER232 = GetClosedEvents<TestEvents, "users/a/b">;
type ER233 = GetClosedEvents<TestEvents, "a/b/c">;

type TestEvents2 = {
    "admin/dashboard/users/**": { admin1: true };
    "admin/dashboard/**": { admin2: boolean };
    "admin/**": { admin3: string };
};
type dc2 = GetWildcardCount<"admin/dashboard/users/**">;
type dc = IsWildcardMatched<"admin/dashboard/users/a", "admin/**">;
type V1 = _GetClosedEventKeys<TestEvents2, "admin/dashboard/users/a">;
type V2 = GetClosedEventKey<TestEvents2, "admin/dashboard/users/a">;
type ER25 = GetClosedEvents<TestEvents2, "admin/dashboard/users">;
type ER2354 = GetClosedEvents<TestEvents2, "admin/dashboard">;
type ER235 = GetClosedEvents<TestEvents2, "admin/dashboard/users/a/d/d/d">;

type Vc0 = WildcardEvents<TestEvents2>;

type RE1 = {
    1: "users/*/login";
    2: "users/*/*";
};

type ddd = RE1[1];

type dds3 = {
    1: {
        [x: string]: 2;
    };
    2: {
        [x: `div/click/${string}`]: boolean;
    };
    3: {
        [x: `x/${string}/y/${string}`]: number;
    };
    4: {
        [x: `${string}/${string}/${string}/${string}`]: 1;
    };
};

// type Expanded = ExpandWildcard<TestEvents>;
// type K = keyof Expanded;

// import { RecordValues } from '.';
// import { MatchEventType } from './MatchPattern';

// type d = MatchEventType<'div/click/xxx', TestEvents>;

// type v1 = RecordValues<MatchEventType<'div/click/x', TestEvents>>;
// type v2 = RecordValues<MatchEventType<'div/click/y', TestEvents>>;
// type v3 = RecordValues<MatchEventType<'x/1/y/2', TestEvents>>;
// type v4 = RecordValues<MatchEventType<'x', TestEvents>>;

// // 使用示例
// declare const test: Expanded;

// // 这些应该都能正常工作
// const test1 = test.a; // string
// const test2 = test['div/click/button']; // boolean
// const test3 = test['div/click/anything']; // boolean
// const test4 = test['x/abc/y/def']; // number
// const test5 = test['x/123/y/456']; // number
// const test6 = test['simpleWildcardtest']; // string
// const test7 = test['no/wildcard']; // string[]

// // 这些应该保持原始行为
// const test8 = test['div/click/*']; // boolean
// const test9 = test['x/*/y/*']; // number

// // 完整的演示
// type Demo = ExpandWildcard<{
//     a: string;
//     'div/click/*': boolean;
//     'x/*/y/*': number;
// }>;
