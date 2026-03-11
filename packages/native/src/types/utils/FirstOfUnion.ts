import { UnionToIntersection } from "./UnionToIntersection";

/**
 * 获取联合类型的第一个成员
 * @description 从联合类型中提取出第一个成员类型
 * @example
 * type Result = FirstOfUnion<"a" | "b" | "c">;
 * // Result = "a"
 */
export type FirstOfUnion<T> =
    UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer U) => any
        ? U
        : never;
