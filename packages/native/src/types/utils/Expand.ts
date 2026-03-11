/**
 * 展开类型，使交集类型合并为单一对象类型
 * @description 展开交叉类型和映射类型，使类型更容易阅读
 * @example
 * type Result = Expand<{ a: 1 } & { b: 2 }>;
 * // Result = { a: 1; b: 2 }
 */
export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
