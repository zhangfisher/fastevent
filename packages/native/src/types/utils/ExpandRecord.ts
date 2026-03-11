/**
 * 将记录类型转换为键值对联合类型
 * @example ExpandRecord<{ a: 1; b: 2 }> = ["a", 1] | ["b", 2]
 */
export type ExpandRecord<T extends Record<string, any>> = {
    [K in keyof T]: [K, T[K]];
}[keyof T];
