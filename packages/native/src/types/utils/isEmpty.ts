/**
 * 检查对象类型是否为空
 * @description 判断对象类型是否没有任何属性
 * @example
 * type Result1 = isEmpty<{}>;
 * // Result1 = true
 * type Result2 = isEmpty<{ a: 1 }>;
 * // Result2 = false
 */
export type isEmpty<T extends Record<string, any>> = [keyof T] extends [never] ? true : false;
