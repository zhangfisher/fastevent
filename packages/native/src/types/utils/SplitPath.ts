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

import { Split } from "./Split";

export type SplitPath<T extends string> = Split<T>;
