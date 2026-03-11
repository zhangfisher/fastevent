import { WildcardKeys } from "./WildcardKeys";

// 获取所有普通键的对象类型
// 将所有普通键合并到一个对象中
export type NormalEvents<T extends Record<string, any>> = {
    [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
};
