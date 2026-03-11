/**
 * 在数字前面追加数字
 * @example PrefixNumber<123, 99> = 99123
 */
export type PrefixNumber<
    T extends number,
    P extends number,
> = `${P}${T}` extends `${infer R extends number}` ? R : never;
