/**
 * 将联合类型合并为单个对象类型
 * @description 将多个对象类型的联合类型合并成一个包含所有属性的对象类型
 * @example
 * type Result = MergeUnion<{ a: 1 } | { b: 2 }>;
 * // Result = { a: 1; b: 2 }
 */
export type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer U) => void
    ? { [K in keyof U]: U[K] }
    : never;
