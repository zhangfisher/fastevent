// oxlint-disable no-unused-vars
import type { UnionToTuple } from "type-fest";
import { IndexOfMin } from "./utils/IndexOfMin";
import { ToKeyPrioritys } from "./wildcards/ToKeyPrioritys";

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
