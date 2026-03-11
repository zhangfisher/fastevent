/**
 * 检查类型是否为 never
 * @description 判断类型是否为 TypeScript 的 never 类型
 * @example
 * type Result1 = IsNever<never>;
 * // Result1 = true
 * type Result2 = IsNever<string>;
 * // Result2 = false
 */
export type IsNever<T> = [T] extends [never] ? true : false;
