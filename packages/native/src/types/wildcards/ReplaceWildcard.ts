import type { IsMultiWildcard } from "../utils";
import type { Join } from "../utils/Join";
import { Split } from "../utils/Split";

// 辅助类型：处理单个段，如果是 * 则替换为 ${string}
type ProcessSegment<S extends string> = S extends "*" ? `${string}` : S;

// 辅助类型：处理数组中的每一项
export type ProcessSegments<Arr extends string[]> = Arr extends []
    ? []
    : Arr extends [infer First extends string, ...infer Rest extends string[]]
      ? [ProcessSegment<First>, ...ProcessSegments<Rest>]
      : [];

// 将通配符替换为 ${string}
// 新思路：
// 1. 先处理 **（多级通配符，**只能放在未尾
// 2. 然后按 / 分割，对每一段检查，如果是 * 则替换为 ${string}
// 3. 最后合并回去

export type ReplaceWildcard<T> = T extends string
    ? IsMultiWildcard<T> extends true
        ? T extends "**"
            ? `${string}/${string}`
            : T extends "*"
              ? string
              : T extends `${infer Head}/**`
                ? `${ReplaceWildcard<Head>}/${string}`
                : T
        : Join<ProcessSegments<Split<T>>>
    : T;

// export type ReplaceWildcard<T extends string> =
// IsMultiWildcard<T> extends true
//     ? T extends "**"
//         ? `${string}`
//         : T extends `${infer Head}/**`
//           ? `${ReplaceWildcard<Head>}/${string}`
//           : T
//     : Join<ProcessSegments<Split<T>>>;
