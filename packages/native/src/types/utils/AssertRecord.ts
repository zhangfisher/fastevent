/**
 * 断言类型为记录类型
 * @description 如果类型 T 是 Record<string, any> 的子类型，返回 T；否则返回 Record<string, any>
 * @example
 * type Result1 = AssertRecord<{ a: 1 }>;
 * // Result1 = { a: 1 }
 * type Result2 = AssertRecord<string>;
 * // Result2 = Record<string, any>
 */
export type AssertRecord<T> = T extends Record<string, any> ? T : Record<string, any>;
