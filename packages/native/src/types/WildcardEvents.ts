import { Keys } from "./Keys";

// MergeUnion<{ a: 1 } | { b: 2 }> === { a: 1, b: 2 }
export type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer U) => void
    ? { [K in keyof U]: U[K] }
    : never;

type Split<
    S extends string,
    Delimiter extends string = "/",
> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 匹配单个段
type MatchSegment<Input extends string, Pattern extends string> = Pattern extends "*"
    ? true
    : Pattern extends "**"
      ? true
      : Input extends Pattern
        ? true
        : false;

// 递归匹配数组
type MatchPatternArray<InputArr extends string[], PatternArr extends string[]> = InputArr extends [
    infer InputHead extends string,
    ...infer InputTail extends string[],
]
    ? PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
        ? PatternHead extends "**"
            ? // 双星通配符可以匹配0个或多个段
              MatchPatternArray<InputTail, PatternTail> extends true
                ? true
                : MatchPatternArray<InputTail, PatternArr> extends true
                  ? true
                  : MatchPatternArray<InputArr, PatternTail> extends true
                    ? true
                    : false
            : MatchSegment<InputHead, PatternHead> extends true
              ? MatchPatternArray<InputTail, PatternTail>
              : false
        : false // 输入还有剩余但模式已用完
    : PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
      ? PatternHead extends "**"
          ? MatchPatternArray<InputArr, PatternTail> // 双星可以匹配0个段
          : false // 模式还有剩余但输入已用完
      : true; // 两者都匹配完毕

// 主匹配函数
type MatchPattern<T extends string, Pattern extends string> =
    MatchPatternArray<Split<T>, Split<Pattern>> extends true ? { [K in Pattern]: any } : never;

type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
      ? F // 处理undefined情况
      : T; // 否则返回原类型

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
export type WildcardEvents<Events extends Record<string, any>, T extends string> = MergeUnion<
    Fallback<
        {
            [K in keyof Events]: MatchPattern<T, K & string> extends never
                ? never
                : { [P in K]: Events[K] };
        }[keyof Events] extends infer Result
            ? Result extends Record<string, any>
                ? Result
                : Record<string, any>
            : Record<string, any>,
        {
            [K in T]: any;
        }
    >
>;

/**
 * 保留对象中第一项
 */
type FirstObjectItem<T extends Record<string, any>> = Pick<
    T,
    Keys<T> extends any[] ? Keys<T>[0] : never
>;

type isEmpty<T extends Record<string, any>> = keyof T extends never ? true : false;

// 获取包含通配符的键
type GetWildcardItems<T extends Record<string, any>> = {
    [K in keyof T as K extends `${string}*${string}` ? K : K extends `*` ? K : never]: T[K];
};

export type GetNotWildcardItems<T extends Record<string, any>> = {
    [K in keyof T as K extends `${string}*${string}` ? never : K extends `*` ? never : K]: T[K];
};

// 计算通配符数量的辅助类型（使用数组长度，非递归）
type CountWildcards<S extends string, Count extends any[] = []> = S extends `${string}*${string}`
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

// 只返回最相近匹配的事件类型
export type ClosestWildcardEvents<
    Events extends Record<string, any>,
    T extends string,
> = GetFirstMatchedItem<WildcardEvents<Events, T>>;
