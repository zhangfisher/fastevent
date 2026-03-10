// oxlint-disable no-unused-vars
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import type { GetWildcardEventList } from "../../types";

describe("GetWildcardEventList 类型测试", () => {
    test("应该包含单个 * 通配符的对象类型", () => {
        type TestEvents = {
            "*": 2;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [Expect<Equal<Extract<Result, { [x: string]: 2 }>, { [x: string]: 2 }>>];
    });

    test("应该包含路径通配符的对象类型", () => {
        type TestEvents = {
            "div/click/*": boolean;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<Equal<Extract<Result, { [x: `div/click/${string}`]: boolean }>, { [x: `div/click/${string}`]: boolean }>>,
        ];
    });

    test("应该包含多个通配符的对象类型", () => {
        type TestEvents = {
            "x/*/y/*": number;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<
                Equal<Extract<Result, { [x: `x/${string}/y/${string}`]: number }>, { [x: `x/${string}/y/${string}`]: number }>
            >,
        ];
    });

    test("应该保持普通键不变", () => {
        type TestEvents = {
            a: string;
            "simple*test": string;
            "no/wildcard": string[];
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<Equal<Extract<Result, { a: any }>, { a: string }>>,
            Expect<Equal<Extract<Result, { "simple*test": any }>, { "simple*test": string }>>,
            Expect<Equal<Extract<Result, { "no/wildcard": any }>, { "no/wildcard": string[] }>>,
        ];
    });

    test("应该正确处理混合事件类型", () => {
        type TestEvents = {
            a: string;
            "div/click/*": boolean;
            "x/*/y/*": number;
            "simple*test": string;
            "no/wildcard": string[];
            "*/*/*/*": 1;
            "*": 2;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<Equal<Extract<Result, { [x: string]: 2 }>, { [x: string]: 2 }>>,
            Expect<Equal<Extract<Result, { [x: `div/click/${string}`]: boolean }>, { [x: `div/click/${string}`]: boolean }>>,
            Expect<Equal<Extract<Result, { [x: `x/${string}/y/${string}`]: number }>, { [x: `x/${string}/y/${string}`]: number }>>,
            Expect<Equal<Extract<Result, { [x: `${string}/${string}/${string}/${string}`]: 1 }>, { [x: `${string}/${string}/${string}/${string}`]: 1 }>>,
            Expect<Equal<Extract<Result, { a: any }>, { a: string }>>,
            Expect<Equal<Extract<Result, { "simple*test": any }>, { "simple*test": string }>>,
            Expect<Equal<Extract<Result, { "no/wildcard": any }>, { "no/wildcard": string[] }>>,
        ];
    });

    test("应该处理没有通配符的情况", () => {
        type TestEvents = {
            foo: number;
            bar: string;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<Equal<Extract<Result, { foo: number }>, { foo: number }>>,
            Expect<Equal<Extract<Result, { bar: string }>, { bar: string }>>,
        ];
    });

    test("应该处理只有通配符的情况", () => {
        type TestEvents = {
            "*": boolean;
            "a/b/*": number;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<Equal<Extract<Result, { [x: string]: boolean }>, { [x: string]: boolean }>>,
            Expect<Equal<Extract<Result, { [x: `a/b/${string}`]: number }>, { [x: `a/b/${string}`]: number }>>,
        ];
    });

    test("应该处理嵌套通配符", () => {
        type TestEvents = {
            "a/*/b/*/c": string;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type cases = [
            Expect<
                Equal<Extract<Result, { [x: `a/${string}/b/${string}/c`]: string }>, { [x: `a/${string}/b/${string}/c`]: string }>
            >,
        ];
    });

    test("应该处理 ** 多级通配符", () => {
        type TestEvents = {
            "a/**/b": number;
        };
        type Result = GetWildcardEventList<TestEvents>;
        type WildcardType = Extract<Result, { [x: string]: number }>;
        type cases = [Expect<Equal<WildcardType extends { [x: string]: number } ? true : false, true>>];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const _cases: cases = [true];
    });
});
