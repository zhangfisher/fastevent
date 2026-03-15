import { Tuple } from "./Tuple";
import { Sum } from "type-fest";

// export type Add<A extends number, B extends number> = [...Tuple<A>, ...Tuple<B>]["length"];
// export type Add<A extends number, B extends number> = number extends A
//     ? number // A 是泛型
//     : number extends B
//       ? number // B 是泛型
//       : [...Tuple<A>, ...Tuple<B>]["length"]; // 都是字面量，精确计算
// export type Add<A extends number, B extends number> = [A, B] extends [number, number]
//     ? number // 泛型情况
//     : [...Tuple<A>, ...Tuple<B>]["length"]; // 字面量情况
export type Add<A extends number, B extends number> = Sum<A, B>;
