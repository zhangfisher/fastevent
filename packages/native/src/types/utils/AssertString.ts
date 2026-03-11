/**
 * 断言类型为字符串类型
 * @description 如果类型 T 是 string 的子类型，返回 T；否则返回 string
 * @example
 * type Result1 = AssertString<"hello">;
 * // Result1 = "hello"
 * type Result2 = AssertString<number>;
 * // Result2 = string
 */
export type AssertString<T> = T extends string ? T : string;
