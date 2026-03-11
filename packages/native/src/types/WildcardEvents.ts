import { CountFixedSegments } from "./WildcardPriority";
import { Equal, Keys } from "./utils";

type Split<
    S extends string,
    Delimiter extends string = "/",
> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

/**
 * 计算两个路径的匹配度（1-9）
 * 规则：将路径分段，逐段比较，只有非通配符段相等时才 +1
 * 通配符段包括：*、**、${string}
 */
export type GetMatchRate<Input extends string, Pattern extends string> = GetMatchRateImpl<
    Split<Input>,
    Split<Pattern>,
    0
>;

type GetMatchRateImpl<
    InputArr extends string[],
    PatternArr extends string[],
    Acc extends number,
> = InputArr extends [infer InputHead extends string, ...infer InputTail extends string[]]
    ? PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
        ? IsWildcardSegment<PatternHead> extends true
            ? GetMatchRateImpl<InputTail, PatternTail, Acc> // 通配符段，不累加，继续
            : Equal<InputHead, PatternHead> extends true
              ? GetMatchRateImpl<InputTail, PatternTail, Add<Acc, 1>> // 相等，累加
              : Acc // 不相等，停止
        : Acc
    : PatternArr extends [string, ...string[]]
      ? Acc
      : Acc;

type Add<A extends number, B extends number> = [...Tuple<A>, ...Tuple<B>]["length"] & number;
type Tuple<T extends number, R extends unknown[] = []> = R["length"] extends T
    ? R
    : Tuple<T, [...R, unknown]>;

/**
 * 判断一个字符串段是否为通配符
 * 通配符包括：*、**、${string}
 */
type IsWildcardSegment<S extends string> = S extends "*" | "**"
    ? true
    : S extends `${string}{${string}}` // 匹配 ${...} 格式
      ? true
      : false;

// 匹配单个段
type MatchSegment<Input extends string, Pattern extends string> = Pattern extends "*"
    ? true
    : Pattern extends "**"
      ? true
      : Input extends Pattern
        ? true
        : false;
type MatchPatternArray<InputArr extends string[], PatternArr extends string[]> = InputArr extends [
    infer InputHead extends string,
    ...infer InputTail extends string[],
]
    ? PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
        ? PatternHead extends "**"
            ? // 双星通配符匹配逻辑
              // 1. 尝试让 ** 匹配 0 个段（跳过 **）
              MatchPatternArray<InputArr, PatternTail> extends true
                ? true
                : // 2. ** 至少匹配一个段（贪婪匹配）
                  InputArr extends [infer _First, ...infer Rest extends string[]]
                  ? MatchPatternArray<Rest, PatternTail> extends true
                      ? true
                      : MatchPatternArray<Rest, PatternArr> extends true
                        ? true
                        : false
                  : false
            : MatchSegment<InputHead, PatternHead> extends true
              ? MatchPatternArray<InputTail, PatternTail>
              : false
        : false // 输入还有剩余但模式已用完
    : PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
      ? // 输入为空，检查模式
        PatternHead extends "**"
          ? // ** 不能匹配空输入（除非是路径开头）
            PatternTail extends []
              ? false // 模式只有 **，没有其他内容，不匹配
              : MatchPatternArray<InputArr, PatternTail> // 尝试跳过 ** 匹配剩余
          : false // 模式还有剩余但输入已用完
      : true; // 两者都匹配完毕

// 主匹配函数
export type MatchPattern<T extends string, Pattern extends string> =
    MatchPatternArray<Split<T>, Split<Pattern>> extends true ? { [K in Pattern]: any } : never;

/**
 * 判断输入路径是否匹配通配符模式
 * @param Input 输入路径
 * @param Pattern 通配符模式（支持 `*` 单级匹配和 `**` 末尾多级匹配）
 * @returns 匹配返回 true，否则返回 false
 *
 * @example true
 * IsWildcardMatched<"api/v1/users", "users/**"> // false
 */
export type IsWildcardMatched<Input extends string, Pattern extends string> =
    MatchPatternArray<Split<Input>, Split<Pattern>> extends true ? true : false;

/**
 *
 * 返回所有匹配事件的类型
 *
 * 支持通配符
 *
 * @param T 事件名称
 * @param Events 事件类型
 * @returns
 *
 */
/**
 * 根据匹配度获取键的分组
 * 将 Events 中的键按照与 T 的匹配度分组
 */
export type GroupByMatchRate<
    Events extends Record<string, any>,
    T extends string,
    Rate extends number,
> = {
    [K in Exclude<keyof Events, number | symbol> as GetMatchRate<T, K> extends Rate
        ? K
        : never]: Events[K];
};

/**
 * 对每个匹配度分组执行 GetMatchedEvents
 */
export type GetMatchedEventsByRate<
    Events extends Record<string, any>,
    T extends string,
    Rate extends number,
> =
    GroupByMatchRate<Events, T, Rate> extends infer Grouped
        ? Grouped extends Record<string, any>
            ? {
                  [K in keyof Grouped]: MatchPattern<T, K & string> extends never
                      ? never
                      : { [P in K]: Grouped[K] };
              }[keyof Grouped]
            : never
        : never;

/**
 * 返回所有匹配事件的类型（使用匹配度分组避免值类型混合）
 * 将所有匹配度的分组结果进行 `&` 合并，自动过滤 never
 */
export type GetMatchedEvents<Events extends Record<string, any>, T extends string> = MergeNonNever<
    GetMatchedEventsByRate<Events, T, 0>,
    GetMatchedEventsByRate<Events, T, 1>,
    GetMatchedEventsByRate<Events, T, 2>,
    GetMatchedEventsByRate<Events, T, 3>,
    GetMatchedEventsByRate<Events, T, 4>,
    GetMatchedEventsByRate<Events, T, 5>,
    GetMatchedEventsByRate<Events, T, 6>,
    GetMatchedEventsByRate<Events, T, 7>,
    GetMatchedEventsByRate<Events, T, 8>,
    GetMatchedEventsByRate<Events, T, 9>
>;

/**
 * 合并多个类型，过滤掉 never
 * 递归地将非 never 类型进行 & 合并
 */
type MergeNonNever<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10> = T1 extends never
    ? MergeNonNever<T2, T3, T4, T5, T6, T7, T8, T9, T10, never>
    : T2 extends never
      ? MergeNonNever<T1, T3, T4, T5, T6, T7, T8, T9, T10, never>
      : T3 extends never
        ? MergeNonNever<T1, T2, T4, T5, T6, T7, T8, T9, T10, never>
        : T4 extends never
          ? MergeNonNever<T1, T2, T3, T5, T6, T7, T8, T9, T10, never>
          : T5 extends never
            ? MergeNonNever<T1, T2, T3, T4, T6, T7, T8, T9, T10, never>
            : T6 extends never
              ? MergeNonNever<T1, T2, T3, T4, T5, T7, T8, T9, T10, never>
              : T7 extends never
                ? MergeNonNever<T1, T2, T3, T4, T5, T6, T8, T9, T10, never>
                : T8 extends never
                  ? MergeNonNever<T1, T2, T3, T4, T5, T6, T7, T9, T10, never>
                  : T9 extends never
                    ? MergeNonNever<T1, T2, T3, T4, T5, T6, T7, T8, T10, never>
                    : T10 extends never
                      ? MergeNonNever<T1, T2, T3, T4, T5, T6, T7, T8, T9, never>
                      : T1 & T2 & T3 & T4 & T5 & T6 & T7 & T8 & T9 & T10;
/**
 * 保留对象中第一项
 */
type FirstObjectItem<T extends Record<string, any>> = Pick<
    T,
    Keys<T> extends any[] ? Keys<T>[0] : never
>;

// 获取包含通配符的键
type GetWildcardItems<T extends Record<string, any>> = {
    [K in keyof T as K extends `${string}*${string}` ? K : K extends `*` ? K : never]: T[K];
};

export type GetNotWildcardItems<T extends Record<string, any>> = {
    [K in keyof T as K extends `${string}*${string}` ? never : K extends `*` ? never : K]: T[K];
};

// 计算通配符数量的辅助类型（使用数组长度，非递归）
type CountWildcards<S extends string, _Count extends any[] = []> = S extends `${string}*${string}`
    ? S extends `${string}*${string}*${string}`
        ? S extends `${string}*${string}*${string}*${string}`
            ? S extends `${string}*${string}*${string}*${string}*${string}`
                ? 5
                : 4
            : 3
        : 2
    : 1;

// 获取只含特定数量通配符的键
type GetWildcardsWithCount<T extends Record<string, any>, N extends number> = {
    [K in keyof T as K extends `${string}*${string}`
        ? CountWildcards<K> extends N
            ? K
            : never
        : K extends `*`
          ? N extends 1
              ? K
              : never
          : never]: T[K];
};

// 检查类型是否为空
type IsEmptyObject<T> = keyof T extends never ? true : false;

/**
 * 改进的选择逻辑：优先级过滤
 * 1. 不含通配符的键优先
 * 2. 当所有键都含通配符时，按通配符数量从少到多优先（1→2→3→4→其他）
 */
type GetWildcardsByPriority<T extends Record<string, any>> =
    IsEmptyObject<GetNotWildcardItems<T>> extends true
        ? IsEmptyObject<GetWildcardsWithCount<T, 1>> extends true
            ? IsEmptyObject<GetWildcardsWithCount<T, 2>> extends true
                ? IsEmptyObject<GetWildcardsWithCount<T, 3>> extends true
                    ? IsEmptyObject<GetWildcardsWithCount<T, 4>> extends true
                        ? FirstObjectItem<GetWildcardItems<T>>
                        : FirstObjectItem<GetWildcardsWithCount<T, 4>>
                    : FirstObjectItem<GetWildcardsWithCount<T, 3>>
                : FirstObjectItem<GetWildcardsWithCount<T, 2>>
            : FirstObjectItem<GetWildcardsWithCount<T, 1>>
        : FirstObjectItem<GetNotWildcardItems<T>>;

export type GetFirstMatchedItem<T extends Record<string, any>> = GetWildcardsByPriority<T>;

/**
 * 计算路径中的固定段数量（非通配符的段）
 * 用于确定通配符模式的精确程度，固定段越多越精确
 */
type PathFixedSegmentsCount<T extends string> = CountFixedSegments<T>;

/**
 * 从匹配的事件中选择固定段数量最多的模式
 *
 * 优先级规则：
 * 1. 固定段数量越多越优先（更精确）
 * 2. 固定段数量相同时，使用原有逻辑（通配符少的优先）
 */
type SelectByMaxFixedSegments<T extends Record<string, any>> = T extends { [K: string]: any }
    ? SelectByFixedSegmentCount<T, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0>
    : never;

type SelectByFixedSegmentCount<
    T extends Record<string, any>,
    N10 extends number,
    N9 extends number,
    N8 extends number,
    N7 extends number,
    N6 extends number,
    N5 extends number,
    N4 extends number,
    N3 extends number,
    N2 extends number,
    N1 extends number,
    N0 extends number,
> =
    IsEmptyObject<GetKeysWithFixedSegments<T, N10>> extends true
        ? IsEmptyObject<GetKeysWithFixedSegments<T, N9>> extends true
            ? IsEmptyObject<GetKeysWithFixedSegments<T, N8>> extends true
                ? IsEmptyObject<GetKeysWithFixedSegments<T, N7>> extends true
                    ? IsEmptyObject<GetKeysWithFixedSegments<T, N6>> extends true
                        ? IsEmptyObject<GetKeysWithFixedSegments<T, N5>> extends true
                            ? IsEmptyObject<GetKeysWithFixedSegments<T, N4>> extends true
                                ? IsEmptyObject<GetKeysWithFixedSegments<T, N3>> extends true
                                    ? IsEmptyObject<GetKeysWithFixedSegments<T, N2>> extends true
                                        ? IsEmptyObject<
                                              GetKeysWithFixedSegments<T, N1>
                                          > extends true
                                            ? IsEmptyObject<
                                                  GetKeysWithFixedSegments<T, N0>
                                              > extends true
                                                ? FirstObjectItem<T>
                                                : FirstObjectItem<GetKeysWithFixedSegments<T, N0>>
                                            : FirstObjectItem<GetKeysWithFixedSegments<T, N1>>
                                        : FirstObjectItem<GetKeysWithFixedSegments<T, N2>>
                                    : FirstObjectItem<GetKeysWithFixedSegments<T, N3>>
                                : FirstObjectItem<GetKeysWithFixedSegments<T, N4>>
                            : FirstObjectItem<GetKeysWithFixedSegments<T, N5>>
                        : FirstObjectItem<GetKeysWithFixedSegments<T, N6>>
                    : FirstObjectItem<GetKeysWithFixedSegments<T, N7>>
                : FirstObjectItem<GetKeysWithFixedSegments<T, N8>>
            : FirstObjectItem<GetKeysWithFixedSegments<T, N9>>
        : FirstObjectItem<GetKeysWithFixedSegments<T, N10>>;
/**
 * 获取包含特定数量固定段的键
 */
type GetKeysWithFixedSegments<T extends Record<string, any>, N extends number> = {
    [K in keyof T as PathFixedSegmentsCount<K & string> extends N ? K : never]: T[K];
};

type UseDefault<T, D extends Record<string, any>> = [T] extends [never] ? D : T;
// 只返回最相近匹配的事件类型
export type GetClosestEvents<
    Events extends Record<string, any>,
    T extends string,
    Default extends Record<string, any> = never,
> = UseDefault<
    GetMatchedEvents<Events, Exclude<T, number | symbol>> extends never
        ? never
        : SelectByMaxFixedSegments<GetMatchedEvents<Events, Exclude<T, number | symbol>>>,
    Default
>;
