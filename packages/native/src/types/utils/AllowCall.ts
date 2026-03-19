import { Overloads } from "./Overloads";

// 检查 Args 是否匹配任何一个重载
export type IsMatchingOverload<Overloads extends any[], Args extends any[]> = Overloads extends [
    infer First,
    ...infer Rest,
]
    ? First extends (...args: any) => any
        ? Args extends Parameters<First>
            ? true
            : IsMatchingOverload<Rest, Args>
        : never
    : false;
/**
 * 获取匹配的重载并推断泛型参数
 * 根据实际传入的参数类型来实例化重载签名中的泛型参数
 *
 * 核心策略：
 * 1. 使用 TypeScript 的条件类型延迟实例化特性
 * 2. 通过 Args extends Parameters<F> 触发类型推断
 * 3. 返回带有实际参数类型的新函数签名
 *
 * @example
 * ```typescript
 * function emit<T extends "a" | "b">(msg: { type: T; payload: Events[T] }): void;
 * type Result = GetMatchingOverload<Overloads<typeof emit>, [{ type: "a"; payload: boolean }]>;
 * ```
 */
export type GetMatchingOverload<Overloads extends any[], Args extends any[]> = Overloads extends [
    infer First,
    ...infer Rest,
]
    ? First extends (...args: any) => infer R
        ? Args extends Parameters<First>
            ? (...args: Args) => R
            : GetMatchingOverload<Rest, Args>
        : GetMatchingOverload<Rest, Args>
    : never;

export type AllowCall<F extends (...args: any) => any, Args extends any[] = []> =
    // 获取函数的所有重载签名
    Overloads<F> extends infer Overloads
        ? Overloads extends any[]
            ? IsMatchingOverload<Overloads, Args> extends true
                ? true
                : false
            : Args extends Parameters<F>
              ? true
              : false
        : never;

// /**
//  * 高级版本：尝试提取并实例化对象参数中的泛型类型
//  * 适用于特定的结构化参数模式
//  */
// type ExtractGenericFromObject<F, Args extends any[]> = F extends (
//     msg: { type: infer T; payload: infer P },
//     ...rest: infer Rest
// ) => infer R
//     ? Args extends [{ type: infer ArgT; payload: infer ArgP }, ...infer _RestArgs]
//         ? ArgT extends T
//             ? (...args: Args) => R
//             : F
//         : F
//     : F;

// import { MutableMessage } from "../MutableMessage";

// interface Events {
//     a: 1;
//     b: 2;
//     c: 3;
// }

// // // 带有可选参数的测试函数
// function test<T extends string = string>(
//     type: Extract<MutableMessage<Events>, { type: T }>["type"],
//     payload: Extract<MutableMessage<Events>, { type: T }>["payload"],
// ): any;
// function test(vip: boolean): any;
// function test(name: string, age?: number): any;
// function test(): any {}

// type sss = Extract<MutableMessage<Events>, { type: "a" }>;
// // type t6 = AllowCall<typeof test, ["Tom"]>; // true
// // type t7 = AllowCall<typeof test, ["Tom", 18]>; // true
// // type t8 = AllowCall<typeof test, ["Tom", 18, true]>; // false
// // type t9 = AllowCall<typeof test, [true]>; // false
// // type t9 = AllowCall<typeof test, [true]>; // false
// type t1 = AllowCall<typeof test, [{ type: "a"; payload: "ddd" }]>; // false
// type t2 = AllowCall<typeof test, [{ type: "a"; payload: "ddd" }]>; // false
// type r1 = GetMatchingOverload<Overloads<typeof test>, [{ type: "a"; payload: 1 }]>; // false

// test("a", 2);
