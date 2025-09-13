// 分割字符串为元组类型
type Split<S extends string, Delimiter extends string> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 匹配模式：检查分割后的key是否匹配分割后的prefix
type MatchPattern<KeyParts extends string[], PrefixParts extends string[]> =
    // 如果prefix部分已经匹配完，则匹配成功
    PrefixParts['length'] extends 0
        ? true
        : // 如果key部分已经匹配完但prefix还有剩余，则匹配失败
        KeyParts['length'] extends 0
        ? false
        : // 检查当前部分
        KeyParts[0] extends PrefixParts[0] | '*'
        ? // 当前部分匹配，继续匹配剩余部分
          MatchPattern<Slice<KeyParts, 1>, Slice<PrefixParts, 1>>
        : false;

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

export type ScopeEvents<Events extends Record<string, any>, Prefix extends string> = {
    [K in keyof Events as K extends string
        ? // 将key和prefix都按'/'分割，然后进行匹配
          MatchPattern<Split<K, '/'>, Split<Prefix, '/'>> extends true
            ? K
            : never
        : never]: Events[K];
};
// export type PickScopeEvents<T extends Record<string, any>, Prefix extends string> = {
//     [K in keyof T as K extends `${Prefix}/${infer Rest}` ? Rest : never]: T[K];
// };
// export type ScopeEvents<T extends Record<string, any>, Prefix extends string> = PickScopeEvents<T, Prefix>;

// // 测试用例
// type Events = {
//     'aa/*': string;
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
// // ^? { 'a/*': string; 'a/*/x': string; }

// type Test2 = ScopeEvents<Events, 'a/x'>;
// // ^? { 'a/*': string; 'a/*/x': string; }

// type Test3 = ScopeEvents<Events, 'b'>;
// // ^? { 'b/*': number; 'b/*/y': number; }

// type Test4 = ScopeEvents<Events, 'c'>;
// // ^? { 'c/*': boolean; }
// type Test5 = ScopeEvents<Events, 'rooms/c'>;
// // ^? { 'rooms/*/add': boolean; 'rooms/*/join': boolean; 'rooms/*/leave': boolean; }
// type Test6 = ScopeEvents<Events, 'rooms'>;
// // ^? { 'rooms/*/add': boolean; 'rooms/*/join': boolean; 'rooms/*/leave': boolean; }
// type Test7 = ScopeEvents<Events, 'rooms/1'>;
