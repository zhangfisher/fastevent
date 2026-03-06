/**
 * 通配符优先级计算工具
 *
 * 用于区分通配符模式的具体程度，解决 
 * 核心规则：固定段多的优先级更高
 */

/**
 * 分割路径为数组
 *  
 */
type SplitPath<T extends string> = T extends `${infer Head}/${infer Tail}`
    ? [Head, ...SplitPath<Tail>]
    : [T];

/**
 * 判断单个路径段是否为通配符
 *
 * 示例：
 * - IsWildcardSegment 星号 → true
 * - IsWildcardSegment "rooms" → false
 */
type IsWildcardSegment<S extends string> = S extends "*" | "**" ? true : false;

/**
 * 计算路径中的固定段数量（非通配符的段）
 * 使用累加器模式，通过元组长度来表示数字
 */
export type CountFixedSegments<T extends string> = CountFixedSegmentsAcc<SplitPath<T>, []>;

/**
 * CountFixedSegments 的辅助实现
 * 使用累加器模式计算固定段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountFixedSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc['length']
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
        ? IsWildcardSegment<First> extends true
            ? CountFixedSegmentsAcc<Rest, Acc>
            : CountFixedSegmentsAcc<Rest, [...Acc, any]>
        : Acc['length'];

/**
 * 判断是否为半通配符（既有固定段又有通配符）
 * 半通配符的固定段数量 ≥ 1 且包含通配符 
 */
export type IsSemiWildcard<T extends string> =
    CountFixedSegments<T> extends 0
        ? false  // 没有固定段 → 全通配符
        : T extends `${string}*${string}` | `*`
            ? true  // 有固定段且有通配符 → 半通配符
            : false;  // 没有通配符 → 精确匹配

// Count wildcard segments in a path
type CountWildcardSegments<T extends string> = CountWildcardSegmentsAcc<SplitPath<T>, []>;

// Helper implementation for counting wildcard segments
type CountWildcardSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc['length']
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
        ? IsWildcardSegment<First> extends true
            ? CountWildcardSegmentsAcc<Rest, [...Acc, any]>
            : CountWildcardSegmentsAcc<Rest, Acc>
        : Acc['length'];

// Check if pattern is a full wildcard
// Full wildcards: no fixed segments (e.g. *, **) OR only 1 fixed segment with 1 wildcard (e.g. rooms/*)
export type IsFullWildcard<T extends string> =
    CountFixedSegments<T> extends 0
        ? T extends `${string}*${string}` | `*`
            ? true
            : false
        : CountFixedSegments<T> extends 1
            ? CountWildcardSegments<T> extends 1
                ? T extends `${string}*${string}` | `*`
                    ? true
                    : false
                : false
            : false;
