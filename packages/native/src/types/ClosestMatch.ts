// oxlint-disable no-unused-vars
import type { UnionToTuple } from "type-fest";
import { GetWildcardCount } from "./WildcardPriority";
import type { LessThan } from "type-fest";

// 获取元组中的最小值
type Min<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R]
    ? F extends number
        ? R extends number[]
            ? LessThan<F, M> extends true
                ? Min<R, F>
                : Min<R, M>
            : M
        : M
    : M;

// 辅助类型：构建指定长度的元组
type IndexOfMin<T extends number[], M = Min<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[],
]
    ? F extends M
        ? Idx["length"]
        : IndexOfMin<R, M, [...Idx, any]>
    : never;

// oxlint-disable no-unused-vars
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

type FirstOfUnion<T> =
    UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer U) => any
        ? U
        : never;
type ToWildcardCounts<T extends any[]> = {
    [i in keyof T]: GetWildcardCount<T[i]>;
};
export type ClosestMatch<T> = UnionToTuple<T>[IndexOfMin<ToWildcardCounts<UnionToTuple<T>>>];

// ------------------
// type test1 = IndexOfMin<[2, 1, 2]>; // 1
// type test2 = IndexOfMin<[1, 2, 3]>; // 0
// type test3 = IndexOfMin<[5, 3, 8, 1, 9]>; // 3
// type test4 = IndexOfMin<[10, 10, 10]>; // 0
// type test5 = IndexOfMin<[3, 2, 1]>; // 2

// type p1 = [1, 2, 2];
// type result1 = Min<p1>; // 1
// type result1Min = IndexOfMin<p4>; // 10

// type p2 = [2, 10, 0, 2];
// type result2 = Min<p2>; // 1
// type result2Min = IndexOfMin<p2>; // 10

// type p3 = [5, 3, 8, 1, 9];
// type result3 = Min<p3>; // 1
// type result3Min = IndexOfMin<p4>; // 10

// type p4 = [10, 10, 10];
// type result4 = Min<p4>; // 10
// type result4Min = IndexOfMin<p4>; // 10

// type Keys = "*/*/login" | "users/*/*" | "users/*/login" | "*/fish/*";
// type ER5 = FirstOfUnion<Keys>;
// type ER52 = UnionToTuple<Keys>;

// type ER54 = ToWildcardCounts<ER52>;

// type x = ClosestMatch<Keys>;
