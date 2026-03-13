/**
 * 确保字符串类型至少包含指定的字符串字面量
 *
 * 该类型工具保证结果类型包含 T1 中的所有字符串，同时可以包含 T2 中的其他字符串。
 * 通过使用 `Omit<T2, T1>` 排除 T2 中已在 T1 存在的字符串，避免重复。
 *
 * @template T1 - 必须包含的字符串类型（字符串字面量或联合类型）
 * @template T2 - 可选的字符串类型集合，默认为 `string`
 *
 * @example
 * ```ts
 * // 基础用法
 * type Result1 = EnsureString<'a', 'a' | 'b' | 'c'>;
 * // Result1: 'a' | 'b' | 'c'
 *
 * // 使用默认的 T2 参数
 * type Result2 = EnsureString<'hello'>;
 * // Result2: 'hello' | string（即 string）
 *
 * // 多个字符串字面量
 * type Result3 = EnsureString<'a' | 'b', 'a' | 'b' | 'c' | 'd'>;
 * // Result3: 'a' | 'b' | 'c' | 'd'
 * ```
 *
 * @category Type Utils
 */
export type MergeStrings<T1 extends string, T2 extends string = string> = T1 | Omit<T2, T1>;
