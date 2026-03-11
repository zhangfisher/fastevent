// oxlint-disable no-unused-vars
import type { UnionToTuple, Subtract } from "type-fest";
import { GetPartCount } from "./WildcardPriority";
import { GetWildcardCount } from "./GetWildcardCount";
import type { LessThan } from "type-fest";
import { IsMultiWildcard, PrefixNumber } from "./utils";

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
// 获取元组中最小值的索引
type IndexOfMin<T extends number[], M = Min<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[],
]
    ? F extends M
        ? Idx["length"]
        : IndexOfMin<R, M, [...Idx, any]>
    : never;

type Max<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R]
    ? F extends number
        ? R extends number[]
            ? LessThan<F, M> extends true
                ? Max<R, M>
                : Max<R, F>
            : M
        : M
    : M;
// 获取元组中最大值的索引
type IndexOfMax<T extends number[], M = Max<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[],
]
    ? F extends M
        ? Idx["length"]
        : IndexOfMax<R, M, [...Idx, any]>
    : never;

// oxlint-disable no-unused-vars
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never;

type FirstOfUnion<T> =
    UnionToIntersection<T extends any ? (x: T) => any : never> extends (x: infer U) => any
        ? U
        : never;

export type ToWildcardCounts<T extends any[]> = {
    [i in keyof T]: GetWildcardCount<T[i]>;
};
export type ToFixedCounts<T extends any[]> = {
    [i in keyof T]: GetPartCount<T[i]>;
};

/**
 * 计算输入的Key元组的优先级元组
 *
 * 用于匹配时使用
 */
export type ToKeyPrioritys<T extends any[]> = {
    [i in keyof T]: IsMultiWildcard<T[i]> extends true
        ? PrefixNumber<Subtract<10, GetPartCount<T[i]>>, 99>
        : GetWildcardCount<T[i]>;
};

export type ClosestMatch<T> = UnionToTuple<T>[IndexOfMin<ToKeyPrioritys<UnionToTuple<T>>>];

// ------------------
// type Keys = "a/**" | "a/b/**" | "a/b/c/**" | "a/b/c/d" | "a/b/*/d" | "a/*/*/d" | "a/*/*/*";
// type T1 = UnionToTuple<Keys>;
// type T2 = ToKeyPrioritys<T1>;
// type d1 = GetWildcardCount<"a/**">;
// type d2 = GetWildcardCount<"a/b/**">;
// type R1 = ClosestMatch<Keys>;

// type Keys2 = "a/*/*" | "x/y/z/*/b";
// type T21 = UnionToTuple<Keys2>;
// type T22 = ToWildcardCounts<T21>;
// type T2d2 = ToWildcardCounts<T21>;
// type R21 = ClosestMatch<Keys2>;

// type Keys3 = "a" | "x/y/z/" | "a/b";
// type T321 = UnionToTuple<Keys3>;
// type T322 = ToWildcardCounts<T321>;
// type T32d2 = ToWildcardCounts<T321>;
// type R321 = ClosestMatch<Keys3>;

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

// type max1 = Max<[1, 2, 3, 4, 5]>;
// type maxIndex1 = IndexOfMax<[1, 2, 3, 4, 5]>;

// type max2 = Max<[6, 1, 2, 3, 4, 5]>;
// type maxIndex2 = IndexOfMax<[6, 1, 2, 3, 4, 5]>;

// type max3 = Max<[1, 6, 1, 2, 3, 4, 5]>;
// type maxIndex3 = IndexOfMax<[1, 1, 6, 1, 2, 3, 4, 5]>;
