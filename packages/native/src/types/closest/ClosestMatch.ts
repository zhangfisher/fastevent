// oxlint-disable no-unused-vars
import type { UnionToTuple } from "type-fest";
import { IndexOfMin } from "../utils/IndexOfMin";
import { ToKeyPrioritys } from "../wildcards/ToKeyPrioritys";

// 用 infer Tuple 把 UnionToTuple<T> 求值一次并复用，避免同一表达式内重复求值
// 该递归类型成本较高（O(n²)），重复求值会击穿 TS 类型比较的栈深度（TS 2321）
export type ClosestMatch<T> = UnionToTuple<T> extends infer Tuple extends any[]
    ? Tuple[IndexOfMin<ToKeyPrioritys<Tuple>>]
    : never;
