import { IsMultiWildcard } from "./utils";
import { CountWildcardSegmentsAcc, SplitPath } from "./WildcardPriority";

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
