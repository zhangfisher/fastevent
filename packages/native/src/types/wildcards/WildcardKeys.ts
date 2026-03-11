import { ContainsWildcard } from "./ContainsWildcard";

// 提取所有包含通配符的键

export type WildcardKeys<T> = {
    [K in keyof T]: K extends string ? (ContainsWildcard<K> extends true ? K : never) : never;
}[keyof T];
