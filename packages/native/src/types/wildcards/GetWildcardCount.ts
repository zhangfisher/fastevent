import { IsMultiWildcard } from "../utils";
import { SplitPath } from "../utils/SplitPath";
import { IsWildcardPart } from "./IsWildcardPart";

/**
 * CountWildcardSegments 的辅助实现
 * 使用累加器模式计算通配符段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountWildcardSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc["length"]
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? IsWildcardPart<First> extends true
          ? CountWildcardSegmentsAcc<Rest, [...Acc, any]>
          : CountWildcardSegmentsAcc<Rest, Acc>
      : Acc["length"];

/**
 * 计算路径中通配符段的数量
 *
 * 通配符段是指完全等于星号或双星号的段
 *
 * @example
 *
 * GetWildcardCount<"*">
 *
 *
 */
export type GetWildcardCount<T extends string> =
    IsMultiWildcard<T> extends true ? 99 : CountWildcardSegmentsAcc<SplitPath<T>, []>;
