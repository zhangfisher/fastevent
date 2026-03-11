import { Equal } from "./Equal";

/**
 * 提取出精确不等于指定键的记录
 * @description 从对象类型中提取出键不精确等于指定字符串的属性
 * @example
 * type Result = PickNotEqualRecord<{ a: 1; b: 2; c: 3 }, "a">;
 * // Result = { b: 2; c: 3 }
 */
export type PickNotEqualRecord<R extends Record<string, any>, T extends string> = {
    [K in keyof R as Equal<K, T> extends true ? never : K]: R[K];
};
