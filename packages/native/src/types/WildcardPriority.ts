// oxlint-disable no-unused-vars
/**
 * 通配符优先级计算工具
 *
 * 用于区分通配符模式的具体程度，解决
 * 核心规则：固定段多的优先级更高
 */

/**
 * 分割路径为数组（支持没有 / 的情况）
 *
 * 处理逻辑：
 * - 如果有 /，按 / 分割成多段数组
 * - 如果没有 /，返回包含单个元素的数组 [原字符串]
 * - 空字符串会返回 [""]
 *
 * @example
 * - SplitPath<"a/b/c"> => ["a", "b", "c"]
 * - SplitPath<"click"> => ["click"]
 * - SplitPath<"*"> => ["*"]
 * - SplitPath<""> => [""]
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
export type IsWildcardSegment<S extends string> = S extends "*" | "**" ? true : false;

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
    ? Acc["length"]
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? IsWildcardSegment<First> extends true
          ? CountFixedSegmentsAcc<Rest, Acc>
          : CountFixedSegmentsAcc<Rest, [...Acc, any]>
      : Acc["length"];

export type GetPartCountAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc["length"]
    : Arr extends [infer _First extends string, ...infer Rest extends string[]]
      ? GetPartCountAcc<Rest, [...Acc, any]>
      : Acc["length"];

export type GetPartCount<T extends string> = GetPartCountAcc<SplitPath<T>, []>;

/**
 * 判断是否为半通配符（既有固定段又有独立的通配符段）
 *
 * 判断逻辑：
 * 1. 使用 SplitPath 将路径分割成段数组（自动处理没有斜杠的情况）
 * 2. 检查是否有固定段（非通配符段）且至少有一个独立的通配符段
 * 3. 独立的通配符段是指完全等于星号或双星号的段
 *
 * 详细示例请参考测试文件 WildcardPriority.test.ts
 */
export type IsSemiWildcard<T extends string> =
    CountFixedSegments<T> extends 0
        ? false // 没有固定段 → 全通配符
        : GetWildcardCount<T> extends 0
          ? false // 没有通配符段 → 精确匹配
          : true; // 有固定段且有通配符段 → 半通配符

/**
 * 计算路径中通配符段的数量
 *
 * 通配符段是指完全等于星号或双星号的段
 * 使用 SplitPath 分割路径后，统计通配符段的数量
 */
export type GetWildcardCount<T extends string> = CountWildcardSegmentsAcc<SplitPath<T>, []>;

/**
 * CountWildcardSegments 的辅助实现
 * 使用累加器模式计算通配符段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountWildcardSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc["length"]
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? IsWildcardSegment<First> extends true
          ? CountWildcardSegmentsAcc<Rest, [...Acc, any]>
          : CountWildcardSegmentsAcc<Rest, Acc>
      : Acc["length"];

/**
 * 检查是否为全通配符模式
 *
 * 全通配符定义：
 * 1. 没有固定段，只有通配符段（如单星号、双星号）
 * 2. 或者只有1个固定段和1个通配符段（如 rooms/单星号）
 *
 * 详细示例请参考测试文件 WildcardPriority.test.ts
 */
export type IsFullWildcard<T extends string> =
    CountFixedSegments<T> extends 0
        ? GetWildcardCount<T> extends 0
            ? false // 没有固定段也没有通配符段 → 不可能
            : true // 没有固定段但有通配符段 → 全通配符
        : CountFixedSegments<T> extends 1
          ? GetWildcardCount<T> extends 1
              ? true // 1个固定段和1个通配符段 → 全通配符
              : false
          : false;
