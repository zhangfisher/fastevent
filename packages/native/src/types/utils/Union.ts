/**
 * 展开联合类型的成员
 * @description 将联合类型的每个成员展开为独立对象，再重新组合
 * @example
 * type Result = Union<{ a: 1 } | { b: 2 }>;
 * // Result = { a: 1 } | { b: 2 }
 */
export type Union<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
