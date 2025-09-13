// 分割字符串为元组类型
type Split<S extends string, Delimiter extends string> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 匹配模式并返回剩余部分
type MatchPatternAndGetRemainder<KeyParts extends string[], PrefixParts extends string[], Result extends string[] = []> =
    // 如果prefix部分已经匹配完，返回剩余的key部分
    PrefixParts['length'] extends 0
        ? KeyParts['length'] extends 0
            ? never // 如果剩余部分为空，返回never过滤掉
            : KeyParts
        : // 如果key部分已经匹配完但prefix还有剩余，匹配失败
        KeyParts['length'] extends 0
        ? never
        : // 检查当前部分
        KeyParts[0] extends PrefixParts[0] | '*'
        ? // 当前部分匹配，继续匹配剩余部分
          MatchPatternAndGetRemainder<Slice<KeyParts, 1>, Slice<PrefixParts, 1>, Result>
        : never;

// 获取数组的切片（从指定索引开始）
type Slice<T extends any[], Start extends number, Result extends any[] = []> = Start extends 0
    ? T
    : T extends [infer First, ...infer Rest]
    ? Slice<Rest, Decrement<Start>, Result>
    : Result;

// 数字减1
type Decrement<N extends number> = N extends 0
    ? 0
    : N extends 1
    ? 0
    : N extends 2
    ? 1
    : N extends 3
    ? 2
    : N extends 4
    ? 3
    : N extends 5
    ? 4
    : N extends 6
    ? 5
    : N extends 7
    ? 6
    : N extends 8
    ? 7
    : N extends 9
    ? 8
    : number;

// 将字符串数组连接成字符串
type Join<T extends string[], Delimiter extends string = '/'> = T extends [infer First extends string, ...infer Rest extends string[]]
    ? Rest['length'] extends 0
        ? First
        : `${First}${Delimiter}${Join<Rest, Delimiter>}`
    : '';

export type ScopeEvents<Events extends Record<string, any>, Prefix extends string> = {
    [K in keyof Events as K extends string
        ? MatchPatternAndGetRemainder<Split<K, '/'>, Split<Prefix, '/'>> extends infer Remainder
            ? Remainder extends string[]
                ? Join<Remainder, '/'>
                : never
            : never
        : never]: Events[K];
};

// // 测试用例
// type Events = {
//     'a/*': string;
//     'a/a1/*': string;
//     'a/a2': string;
//     'a/*/x': string;
//     'b/*': number;
//     'b/*/y': number;
//     'c/*': boolean;
//     'rooms/*/add': boolean;
//     'rooms/*/join': boolean;
//     'rooms/*/leave': boolean;
// };

// // 测试
// type Test1 = ScopeEvents<Events, 'a'>;
// // ^? { '*': string; 'a1/*': string; 'a2': string; '*/x': string; }

// type Test2 = ScopeEvents<Events, 'a/x'>;
// // ^? { '*': string; '*/x': string; }  // 移除了空字符串key

// type Test3 = ScopeEvents<Events, 'b'>;
// // ^? { '*': number; '*/y': number; }

// type Test4 = ScopeEvents<Events, 'c'>;
// // ^? { '*': boolean; }

// type Test5 = ScopeEvents<Events, 'rooms/c'>;
// // ^? { '*/add': boolean; '*/join': boolean; '*/leave': boolean; }

// type Test6 = ScopeEvents<Events, 'rooms'>;
// // ^? { '*/add': boolean; '*/join': boolean; '*/leave': boolean; }

// type Test7 = ScopeEvents<Events, 'rooms/1'>;
// // ^? { '*/add': boolean; '*/join': boolean; '*/leave': boolean; }
