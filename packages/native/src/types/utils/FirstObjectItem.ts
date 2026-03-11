import { Keys } from "./Keys";

/**
 * 获取对象的第一个属性
 * @description 从对象类型中提取出第一个键值对
 * @example
 * type Result = FirstObjectItem<{ a: 1; b: 2; c: 3 }>;
 * // Result = { a: 1 }
 */
export type FirstObjectItem<T extends Record<string, any>> = Pick<
    T,
    Keys<T> extends any[] ? Keys<T>[0] : never
>;
