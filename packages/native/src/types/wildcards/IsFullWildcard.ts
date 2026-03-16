import { GetFixedPartCount } from "./GetFixedPartCount";
import { GetWildcardCount } from "./GetWildcardCount";

/**
 * 检查是否为全通配符模式
 *
 * 全通配符定义：
 * 只有完全没有任何固定段（即所有段都是通配符段）的模式才是全通配符
 *
 * 示例：
 * - "*" → true（没有固定段）
 * - "**" → true（没有固定段）
 */

export type IsFullWildcard<T extends string> =
    GetFixedPartCount<T> extends 0
        ? GetWildcardCount<T> extends 0
            ? false // 没有固定段也没有通配符段 → 不可能的情况
            : true // 没有固定段但有通配符段 → 全通配符
        : false; // 有固定段 → 不是全通配符

// 测试类型
type R1 = IsFullWildcard<"*/events">; // false（有固定段）
type R2 = IsFullWildcard<"rooms/*">; // false（有固定段）
type R3 = IsFullWildcard<"*">; // true（没有固定段）
type R4 = IsFullWildcard<"**">; // true（没有固定段）
