import { GetFixedPartCount } from "./GetFixedPartCount";
import { GetWildcardCount } from "./GetWildcardCount";

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
    GetFixedPartCount<T> extends 0
        ? GetWildcardCount<T> extends 0
            ? false // 没有固定段也没有通配符段 → 不可能
            : true // 没有固定段但有通配符段 → 全通配符
        : GetFixedPartCount<T> extends 1
          ? GetWildcardCount<T> extends 1
              ? true // 1个固定段和1个通配符段 → 全通配符
              : false
          : false;

type R1 = IsFullWildcard<"*/events">;
