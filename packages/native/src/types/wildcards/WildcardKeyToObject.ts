import { ReplaceWildcard } from "./ReplaceWildcard";

// ============================================================================
// GetWildcardEventList: 将通配符事件转换为对象列表类型（联合类型）
// ============================================================================
// 判断是否为单个 * 通配符（会匹配任意字符串）
type IsSingleStar<T extends string> = T extends "*" ? true : false;
// 将通配符键转换为对象类型
// 如果是单个 *，使用 string 作为键；否则使用模板字面量类型

export type WildcardKeyToObject<K extends string, V> = K extends K
    ? IsSingleStar<K> extends true
        ? {
              [x: string]: V;
          }
        : {
              [P in ReplaceWildcard<K>]: V;
          }
    : never;
