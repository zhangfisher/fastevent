// oxlint-disable no-unused-vars
/**
 * 通配符优先级计算工具
 *
 * 用于区分通配符模式的具体程度，解决
 * 核心规则：固定段多的优先级更高
 */

import { SplitPath } from "../utils/SplitPath";
import { IsWildcardPart } from "./IsWildcardPart";
/**
 * CountFixedSegments 的辅助实现
 * 使用累加器模式计算固定段数量
 * @param Arr - 路径段数组
 * @param Acc - 累加器（元组），长度即为当前计数
 */
type CountFixedSegmentsAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc["length"]
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? IsWildcardPart<First> extends true
          ? CountFixedSegmentsAcc<Rest, Acc>
          : CountFixedSegmentsAcc<Rest, [...Acc, any]>
      : Acc["length"];

/**
 * 计算路径中的固定段数量（非通配符的段）
 * 使用累加器模式，通过元组长度来表示数字
 */
export type GetFixedPartCount<T extends string> = CountFixedSegmentsAcc<SplitPath<T>, []>;

export type GetPartCountAcc<Arr extends string[], Acc extends any[]> = Arr extends []
    ? Acc["length"]
    : Arr extends [infer _First extends string, ...infer Rest extends string[]]
      ? GetPartCountAcc<Rest, [...Acc, any]>
      : Acc["length"];
