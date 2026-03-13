/**
 * 获取函数的所有重载类型，返回一个包含所有重载签名的联合类型。
 * 这个类型解决了 TypeScript 中 `typeof` 操作符只能获取第一个重载签名的问题。
 *
 * @template T - 要获取重载的函数类型
 *
 * @example
 * ```typescript
 * // 基本用法
 * function parseInput(input: string): string;
 * function parseInput(input: number): number;
 * function parseInput(input: boolean): boolean;
 * function parseInput(input: any): any {
 *   // 实现
 * }
 *
 * // 使用 typeof 只能获取第一个重载
 * type FirstOverload = typeof parseInput;  // (input: string) => string
 *
 * // 使用 Overloads 获取所有重载
 * type AllOverloads = Overloads<typeof parseInput>;
 * // 结果：
 * // ((input: string) => string) |
 * // ((input: number) => number) |
 * // ((input: boolean) => boolean) |
 * // ((input: any) => any)
 *
 * // 实际应用场景
 * interface StringOrNumber {
 *   (value: string): string;
 *   (value: number): number;
 * }
 *
 * const fn: StringOrNumber = (value: any) => value;
 *
 * type FnOverloads = Overloads<typeof fn>;
 * // 结果：
 * // ((value: string) => string) | ((value: number) => number)
 *
 * // 高级用法：创建类型安全的调用函数
 * function callWithOverloads<T extends (...args: any[]) => any>(
 *   fn: T,
 *   ...args: Parameters<Overloads<T>>
 * ): ReturnType<Overloads<T>> {
 *   return fn(...args);
 * }
 *
 * // 可以安全地调用所有重载
 * const result1 = callWithOverloads(parseInput, "hello");  // string
 * const result2 = callWithOverloads(parseInput, 42);      // number
 * const result3 = callWithOverloads(parseInput, true);     // boolean
 *
 * // 内置方法示例
 * type ParseIntOverloads = Overloads<typeof parseInt>;
 * // 结果：
 * // ((string: string, radix?: number) => number) |
 * // ((string: string) => number)
 *
 * // 类方法重载
 * class Calculator {
 *   add(x: number, y: number): number;
 *   add(x: string, y: string): string;
 *   add(x: any, y: any): any {
 *     return x + y;
 *   }
 * }
 *
 * type AddOverloads = Overloads<Calculator['add']>;
 * // 结果：
 * // ((x: number, y: number) => number) |
 * // ((x: string, y: string) => string)
 *
 * // 实用工具类型
 * type OverloadParameters<T> = Parameters<Overloads<T>>;
 * type OverloadReturnType<T> = ReturnType<Overloads<T>>;
 * ```
 */

import { Includes } from "type-fest";

export type Unique<T extends any[], Result extends any[] = []> = T extends [
    infer First,
    ...infer Rest,
]
    ? Includes<Result, First> extends true
        ? Unique<Rest, Result> // 已存在完全相等的元素，跳过
        : Unique<Rest, [...Result, First]> // 不存在，添加到结果
    : Result;
export type Overloads<T> = Unique<
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4;
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6;
        (...args: infer A7): infer R7;
        (...args: infer A8): infer R8;
    }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
          ]
        : T extends {
                (...args: infer A1): infer R1;
                (...args: infer A2): infer R2;
                (...args: infer A3): infer R3;
                (...args: infer A4): infer R4;
                (...args: infer A5): infer R5;
                (...args: infer A6): infer R6;
                (...args: infer A7): infer R7;
            }
          ? [
                (...args: A1) => R1,
                (...args: A2) => R2,
                (...args: A3) => R3,
                (...args: A4) => R4,
                (...args: A5) => R5,
                (...args: A6) => R6,
                (...args: A7) => R7,
            ]
          : T extends {
                  (...args: infer A1): infer R1;
                  (...args: infer A2): infer R2;
                  (...args: infer A3): infer R3;
                  (...args: infer A4): infer R4;
                  (...args: infer A5): infer R5;
                  (...args: infer A6): infer R6;
              }
            ? [
                  (...args: A1) => R1,
                  (...args: A2) => R2,
                  (...args: A3) => R3,
                  (...args: A4) => R4,
                  (...args: A5) => R5,
                  (...args: A6) => R6,
              ]
            : T extends {
                    (...args: infer A1): infer R1;
                    (...args: infer A2): infer R2;
                    (...args: infer A3): infer R3;
                    (...args: infer A4): infer R4;
                    (...args: infer A5): infer R5;
                }
              ? [
                    (...args: A1) => R1,
                    (...args: A2) => R2,
                    (...args: A3) => R3,
                    (...args: A4) => R4,
                    (...args: A5) => R5,
                ]
              : T extends {
                      (...args: infer A1): infer R1;
                      (...args: infer A2): infer R2;
                      (...args: infer A3): infer R3;
                      (...args: infer A4): infer R4;
                  }
                ? [
                      (...args: A1) => R1,
                      (...args: A2) => R2,
                      (...args: A3) => R3,
                      (...args: A4) => R4,
                  ]
                : T extends {
                        (...args: infer A1): infer R1;
                        (...args: infer A2): infer R2;
                        (...args: infer A3): infer R3;
                    }
                  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
                  : T extends {
                          (...args: infer A1): infer R1;
                          (...args: infer A2): infer R2;
                      }
                    ? [(...args: A1) => R1, (...args: A2) => R2]
                    : T extends {
                            (...args: infer A1): infer R1;
                        }
                      ? [(...args: A1) => R1]
                      : [T]
>;

// function foo(a: string): string;
// function foo(a: number): number;
// function foo(a: any): any {}

// type d = Unique<Overloads<typeof foo>>
// type Unique<T extends any[], Result extends any[] = []> =
//     T extends [infer First, ...infer Rest]
//         ? First extends Result[number]
//             ? Unique<Rest, Result>
//             : Unique<Rest, [...Result, First]>
//         : Result;

// import type { Expect, Equal } from "@type-challenges/utils";
// import { FastEvent } from "../../event";

// // 辅助类型：检查数组中是否包含某个类型（使用 Equal 检查完全相等）
// type Includes<T extends any[], U> = T extends [infer First, ...infer Rest]
//     ? Equal<First, U> extends true
//         ? true
//         : Includes<Rest, U>
//     : false;

// declare function emit(event: "a" | "b"): void;
// declare function emit(event: "c", data: string): void;
// declare function emit(event: "d", data: number): void;
// declare function emit(event: string, data?: unknown): void;

// // 提取所有重载的参数类型
// type EmitParams = Overloads<typeof emit>;
// type a1 = Parameters<EmitParams[1]>[0];
// type cases = [
//     // TypeScript 从最不具体的重载开始提取（相反顺序）
//     // [0] = (event: string, data?: unknown) => void - 最后一个声明的重载
//     Expect<Equal<Parameters<EmitParams[0]>[0], "a" | "b">>,

//     // [1] = (event: "d", data: number) => void
//     Expect<Equal<Parameters<EmitParams[1]>[0], "c">>,

//     // [2] = (event: "c", data: string) => void
//     Expect<Equal<Parameters<EmitParams[2]>[0], "d">>,

//     // [3] = (event: "a" | "b") => void - 第一个声明的重载
//     Expect<Equal<Parameters<EmitParams[3]>[0], string>>,
// ];

// interface Events {
//     a: boolean;
//     b: number;
//     c: string;
//     "x/y/z/a": 1;
//     "x/y/z/b": 2;
//     "x/y/z/c": 3;
// }
// const emitter = new FastEvent<Events>();
// type EmitParams2 = Overloads<typeof emitter.emit>;
// type Arg1 = Parameters<EmitParams2[0]>[0];
// type Arg2 = Parameters<EmitParams2[1]>[0];
// type Arg3 = Parameters<EmitParams2[2]>[0];
