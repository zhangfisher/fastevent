import { ContainsWildcard } from "./ContainsWildcard";
import { IsMultiWildcard } from "./IsMultiWildcard";
import { SplitPath } from "../utils/SplitPath";

/**
 * 判断事件名 T 是否匹配模式 P
 *
 * 匹配规则：
 * - 精确匹配：T 完全等于 P（当 P 不包含通配符时）
 * - 单级通配符 *：匹配任意单段路径
 * - 多级通配符 **：匹配零或多段路径
 * - 支持联合类型：P 可以是多个模式的联合，如 "a" | "b"
 *
 * @example
 * - IsMatchEventName<"user/login", "user/login"> = true
 * - IsMatchEventName<"user/login", "user&#47;*"> = true (末尾单级通配符)
 * - IsMatchEventName<"user/login", "*&#47;login"> = true (开头单级通配符)
 * - IsMatchEventName<"user/profile/edit", "user&#47;**"> = true (末尾多级通配符)
 * - IsMatchEventName<"a/b/c", "**"> = true (全通配符)
 * - IsMatchEventName<"user/login", "user/login" | "admin/*"> = true (联合类型)
 */

// 递归匹配两个路径数组（仅含单级通配符 *）
type MatchSingleStar<T extends string[], P extends string[]> = T extends []
    ? P extends []
        ? true
        : false
    : P extends []
      ? false
      : T extends [infer TFirst extends string, ...infer TRest extends string[]]
        ? P extends [infer PFirst extends string, ...infer PRest extends string[]]
            ? PFirst extends "*"
                ? MatchSingleStar<TRest, PRest> // * 匹配一段
                : TFirst extends PFirst
                  ? MatchSingleStar<TRest, PRest>
                  : false
            : false
        : false;

// 递归匹配两个路径数组（支持多级通配符 **）
type MatchWithDoubleStar<T extends string[], P extends string[]> = T extends []
    ? P extends []
        ? true
        : false // T 为空时，P 必须也为空才匹配
    : P extends []
      ? false
      : T extends [infer TFirst extends string, ...infer TRest extends string[]]
        ? P extends [infer PFirst extends string, ...infer PRest extends string[]]
            ? PFirst extends "*"
                ? MatchWithDoubleStar<TRest, PRest> // * 匹配一段
                : PFirst extends "**"
                  ? MatchDoubleStar<T, PRest> // ** 匹配零或多段
                  : TFirst extends PFirst
                    ? MatchWithDoubleStar<TRest, PRest>
                    : false
            : false
        : false;

// ** 通配符匹配：可以匹配零个或多个路径段
type MatchDoubleStar<T extends string[], P extends string[]> = T extends []
    ? P extends []
        ? true
        : false // T 为空时，P 必须也为空才匹配（除非 P 全是 **）
    : P extends []
      ? true // ** 匹配所有剩余的 T
      : T extends [infer _TFirst extends string, ...infer TRest extends string[]]
        ? P extends ["**"]
            ? MatchDoubleStar<TRest, P> // ** 继续消费 T
            : P extends [infer PFirst extends string, ...infer PRest extends string[]]
              ? PFirst extends "*"
                  ? MatchWithDoubleStar<TRest, PRest>
                  : PFirst extends "**"
                    ? MatchDoubleStar<T, PRest>
                    : T extends [infer TFirst extends string, ...infer TRest2 extends string[]]
                      ? TFirst extends PFirst
                          ? MatchWithDoubleStar<TRest2, PRest>
                          : MatchDoubleStar<TRest, P> // ** 继续消费 T
                      : false
              : false
        : false;

// 内部实现：处理单个模式
type IsMatchEventNameImpl<T extends string, P extends string> =
    ContainsWildcard<P> extends false
        ? T extends P
            ? true
            : false // 不包含通配符，精确匹配
        : IsMultiWildcard<P> extends true
          ? MatchWithDoubleStar<SplitPath<T>, SplitPath<P>> // 包含 **，使用多级通配符匹配
          : MatchSingleStar<SplitPath<T>, SplitPath<P>>; // 仅含 *，使用单级通配符匹配

// 导出类型：支持 P 为联合类型
// 当 P 是联合类型时，会对每个成员分别进行匹配，只要有一个匹配就返回 true
export type IsMatchEventName<T extends string, P extends string> =
    P extends any ? IsMatchEventNameImpl<T, P> : never;
