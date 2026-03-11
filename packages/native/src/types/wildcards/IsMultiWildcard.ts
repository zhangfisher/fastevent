/**
 * 检查类型是否为多级通配符（包含 **）
 * @description 判断字符串类型是否包含多级通配符 "**"
 * @example
 * type Result1 = IsMultiWildcard<"user/**">;
 * // Result1 = true
 * type Result2 = IsMultiWildcard<"user/*">;
 * // Result2 = false
 * type Result3 = IsMultiWildcard<**">;
 * // Result3 = true
 */
export type IsMultiWildcard<T extends string> = T extends `${string}/**` | "**" ? true : false;
