type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

// 判断是否包含通配符
type ContainsWildcard<T extends string> = T extends `${string}/*/${string}` ? true : T extends `${string}/*` ? true : T extends `*/${string}` ? true : T extends `*` ? true : false;

// 将通配符替换为 ${string}
type ReplaceWildcard<T extends string> = T extends `*${infer Rest}`
    ? `${string}${ReplaceWildcard<Rest>}`
    : T extends `${infer Head}*${infer Rest}`
    ? `${Head}${string}${ReplaceWildcard<Rest>}`
    : T;

// 提取所有包含通配符的键
type WildcardKeys<T> = {
    [K in keyof T]: K extends string ? (ContainsWildcard<K> extends true ? K : never) : never;
}[keyof T];

// 展开通配符键
export type ExpandWildcard<T extends Record<string, any>> = Expand<
    // 保留原始键值对
    T & {
        // 为每个通配符键创建映射类型
        [K in WildcardKeys<T> as ReplaceWildcard<K>]: T[K];
    }
>;

// // 测试用例
// type TestEvents = {
//     a: string;
//     'div/click/*': boolean;
//     'x/*/y/*': number;
//     'simple*test': string;
//     'no/wildcard': string[];
//     '*/*/*/*': 1;
//     '*': 2;
// };

// type Expanded = ExpandWildcard<TestEvents>;
// type K = keyof Expanded;

// import { RecordValues } from '.';
// import { MatchEventType } from './MatchPattern';

// type d = MatchEventType<'div/click/xxx', TestEvents>;

// type v1 = RecordValues<MatchEventType<'div/click/x', TestEvents>>;
// type v2 = RecordValues<MatchEventType<'div/click/y', TestEvents>>;
// type v3 = RecordValues<MatchEventType<'x/1/y/2', TestEvents>>;
// type v4 = RecordValues<MatchEventType<'x', TestEvents>>;

// // 使用示例
// declare const test: Expanded;

// // 这些应该都能正常工作
// const test1 = test.a; // string
// const test2 = test['div/click/button']; // boolean
// const test3 = test['div/click/anything']; // boolean
// const test4 = test['x/abc/y/def']; // number
// const test5 = test['x/123/y/456']; // number
// const test6 = test['simpleWildcardtest']; // string
// const test7 = test['no/wildcard']; // string[]

// // 这些应该保持原始行为
// const test8 = test['div/click/*']; // boolean
// const test9 = test['x/*/y/*']; // number

// // 完整的演示
// type Demo = ExpandWildcard<{
//     a: string;
//     'div/click/*': boolean;
//     'x/*/y/*': number;
// }>;
