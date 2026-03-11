import { ValueOf } from "type-fest";
import { WildcardKeyToObject } from "./WildcardKeyToObject";
import { WildcardKeys } from "./WildcardKeys";

// 将联合类型转换为带数字索引的 Record 类型
// 注意：由于 TypeScript 类型系统的限制，无法可靠地自动为联合类型生成递增索引
// 这里返回联合类型，这是最可靠的实现
export type WildcardEvents<T extends Record<string, any>> = {
    [K in WildcardKeys<T>]: ValueOf<WildcardKeyToObject<K, T[K]>>;
};
