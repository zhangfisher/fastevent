// oxlint-disable no-unused-vars
import {
    AssertString,
    Expand,
    ExpandRecord,
    FirstObjectItem,
    FirstOfUnion,
    IsMultiWildcard,
} from "./utils";
import { UnionToTuple, ValueOf } from "type-fest";
import { IsWildcardMatched } from "./WildcardEvents";
import { GetPartCount } from "./WildcardPriority";
import { GetWildcardCount } from "./GetWildcardCount";
import { ClosestMatch } from "./ClosestMatch";

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
// 1. 先处理 **（多级通配符，**只能放在未尾
// 2. 然后按 / 分割，对每一段检查，如果是 * 则替换为 ${string}
// 3. 最后合并回去
export type ReplaceWildcard<T extends string> =
    IsMultiWildcard<T> extends true
        ? T extends "**"
            ? `${string}`
            : T extends `${infer Head}/**`
              ? `${ReplaceWildcard<Head>}/${string}`
              : T
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
export type GetClosedEventKeys<Events extends Record<string, any>, T extends string> = {
    [Key in Exclude<keyof Events, number | symbol> as IsWildcardMatched<T, Key> extends true
        ? IsMultiWildcard<Key> extends true //  以/**结尾
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
            : GetPartCount<Key> extends GetPartCount<T> // 分段数一样时才比较通配符的数量,数量越小优先级越高
              ? GetWildcardCount<Key> extends 0 // 没有通配符
                  ? 0
                  : GetWildcardCount<Key> extends 1
                    ? 1
                    : GetWildcardCount<Key> extends 2
                      ? 2
                      : GetWildcardCount<Key> extends 3
                        ? 3
                        : GetWildcardCount<Key> extends 4
                          ? 4
                          : GetWildcardCount<Key> extends 5
                            ? 5
                            : GetWildcardCount<Key> extends 6
                              ? 6
                              : GetWildcardCount<Key> extends 7
                                ? 7
                                : GetWildcardCount<Key> extends 8
                                  ? 8
                                  : GetWildcardCount<Key> extends 9
                                    ? 9
                                    : never
              : never
        : T extends Key
          ? 0
          : never]: Key; //ClosestMatch<Key>
};

/**
 * 返回匹配T的所有Key
 *
 * @example
 *
 *
 */
export type GetMatchedEventKeys<Events extends Record<string, any>, T extends string> =
    | (GetClosedEventKeys<Events, T> extends { 0: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 1: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 2: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 3: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 4: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 5: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 6: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 7: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 8: infer V } ? (V extends never ? never : V) : never)
    | (GetClosedEventKeys<Events, T> extends { 9: infer V }
          ? V extends never
              ? never
              : V
          : never);

/**
 * 返回最接近的Key
 */
export type GetRecommendEventKey<Events extends Record<string, any>, T extends string> =
    GetClosedEventKeys<Events, T> extends never
        ? never
        : ClosestMatch<GetMatchedEventKeys<Events, T>>;

export type GetClosedEvents<
    Events extends Record<string, any>,
    T extends string,
    D = Record<string, any>,
> =
    GetRecommendEventKey<Events, T> extends never
        ? D
        : Record<
              AssertString<GetRecommendEventKey<Events, T>>,
              Events[AssertString<GetRecommendEventKey<Events, T>>]
          >;

export type GetClosedEventDefine<
    Events extends Record<string, any>,
    T extends string,
    D = any,
> = ExpandRecord<GetClosedEvents<Events, T>>;
