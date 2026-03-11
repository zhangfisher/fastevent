/**
 * 移除空对象类型约束
 * @description 从类型中移除空的字面量类型约束，返回基础类型
 * @example
 * type Result = RemoveEmptyObject<{} & string>;
 * // Result = string
 */
export type RemoveEmptyObject<T extends Record<string, any>> = T extends {} & (infer O) ? O : T;
