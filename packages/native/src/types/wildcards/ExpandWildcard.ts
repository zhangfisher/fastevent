import { Expand } from "../utils";
import { ReplaceWildcard } from "./ReplaceWildcard";
import { WildcardKeys } from "./WildcardKeys";

// 展开通配符键

export type ExpandWildcard<T extends Record<string, any>> = Expand<
    // 保留原始键值对
    {
        [K in WildcardKeys<T> as ReplaceWildcard<K>]: T[K];
    } & {
        [K in Exclude<keyof T, WildcardKeys<T>>]: T[K];
    }
>;
