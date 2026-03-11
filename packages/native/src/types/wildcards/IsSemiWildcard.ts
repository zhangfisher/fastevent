import { GetWildcardCount } from "./GetWildcardCount";
import { GetFixedPartCount } from "./GetFixedPartCount";

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
    GetFixedPartCount<T> extends 0
        ? false // 没有固定段 → 全通配符
        : GetWildcardCount<T> extends 0
          ? false // 没有通配符段 → 精确匹配
          : true; // 有固定段且有通配符段 → 半通配符
