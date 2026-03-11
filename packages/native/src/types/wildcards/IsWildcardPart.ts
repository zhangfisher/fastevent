/**
 * 判断单个路径段是否为通配符
 *
 * 示例：
 * - IsWildcardSegment 星号 → true
 * - IsWildcardSegment "rooms" → false
 */

export type IsWildcardPart<S extends string> = S extends "*" | "**" ? true : false;
