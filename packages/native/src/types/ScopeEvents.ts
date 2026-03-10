import {
    ExtendWildcardEvents,
    FastEventMessage,
    GetClosestEvents,
    GetPayload,
    ReplaceWildcard,
} from ".";
import {
    RemoveEmptyObject,
    AssertRecord,
    PickInlcudeDelimiterRecord,
    PickNotInlcudeDelimiterRecord,
} from "./utils";
// 分割字符串为元组类型
type Split<
    S extends string,
    Delimiter extends string,
> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 匹配模式并返回剩余部分
type MatchPatternAndGetRemainder<
    KeyParts extends string[],
    PrefixParts extends string[],
    Result extends string[] = [],
> =
    // 如果prefix部分已经匹配完，返回剩余的key部分
    PrefixParts["length"] extends 0
        ? KeyParts["length"] extends 0
            ? never // 如果剩余部分为空，返回never过滤掉
            : KeyParts
        : // 如果key部分已经匹配完但prefix还有剩余，匹配失败
          KeyParts["length"] extends 0
          ? never
          : // 检查当前部分
            KeyParts[0] extends PrefixParts[0] | "*"
            ? // 当前部分匹配，继续匹配剩余部分
              MatchPatternAndGetRemainder<Slice<KeyParts, 1>, Slice<PrefixParts, 1>, Result>
            : never;

// 获取数组的切片（从指定索引开始）
type Slice<T extends any[], Start extends number, Result extends any[] = []> = Start extends 0
    ? T
    : T extends [infer _First, ...infer Rest]
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
type Join<T extends string[], Delimiter extends string = "/"> = T extends [
    infer First extends string,
    ...infer Rest extends string[],
]
    ? Rest["length"] extends 0
        ? First
        : `${First}${Delimiter}${Join<Rest, Delimiter>}`
    : "";

// ScopeEvents 内部实现
type ScopeEventsImpl<Events extends Record<string, any>, Prefix extends string> = {
    [K in keyof Events as K extends string
        ? MatchPatternAndGetRemainder<Split<K, "/">, Split<Prefix, "/">> extends infer Remainder
            ? Remainder extends string[]
                ? Join<Remainder, "/">
                : never
            : never
        : never]: Events[K];
};

// 返回指定前缀的事件
// 当 Prefix = '' 时，直接返回 Events
// 当没有事件匹配 Prefix 时，返回 Default
export type ScopeEvents<
    Events extends Record<string, any>,
    Prefix extends string,
    Default extends Record<string, any> = Record<string, any>,
> = Prefix extends ""
    ? Events
    : [keyof ScopeEventsImpl<Events, Prefix>] extends [never]
      ? Default
      : ScopeEventsImpl<Events, Prefix>;

export type MutableEvents<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof ExtendWildcardEvents<Events>]: {
        type: Exclude<K, number | symbol>;
        payload: ExtendWildcardEvents<Events>[K];
        meta: Meta;
    };
}[keyof ExtendWildcardEvents<Events>];

export type MutableMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof ExtendWildcardEvents<Events>]: {
        type: Exclude<K, number | symbol>;
        payload?: GetPayload<Events, Exclude<K, number | symbol>>;
        meta?: Meta;
    };
}[keyof ExtendWildcardEvents<Events>];

type Events = {
    a: 1;
    "c/*": boolean;
    "rooms/*/add": boolean;
    "rooms/*/join": boolean;
    "rooms/*/leave": boolean;
    "rooms/*/*": number;
};

type MEvents = MutableMessage<{
    a: 1;
    "c/*": boolean;
    "rooms/*/add": boolean;
    "rooms/*/join": boolean;
    "rooms/*/leave": boolean;
    "rooms/*/*": number;
}>;

export type ExtendWildcardEvents2<Events extends Record<string, any>> = AssertRecord<
    RemoveEmptyObject<
        {
            // 第一优先级：非通配符键（精确匹配）
            [K in keyof Events as K extends `${string}*${string}` | `*` | `**`
                ? never
                : K]: Events[K];
        } & {
            // 第二优先级：通配符键扩展
            [K in keyof Events as K extends `${string}*${string}` | `*`
                ? ReplaceWildcard<K & string>
                : never]: Events[K];
        }
    >
>;
type ToMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload?: GetPayload<Events, Exclude<K, number | symbol>>;
        meta?: Meta;
    };
}[keyof Events];

type D3 = ExtendWildcardEvents2<Events>;

type E1 = PickInlcudeDelimiterRecord<D3>;
type M1 = ToMessage<E1>;
type EK1 = GetClosestEvents<E1, "rooms/aaa/add">;
type EX1 = E1["rooms/aaa/add"];

type E2 = PickNotInlcudeDelimiterRecord<D3>;
type M2 = ToMessage<E2>;
type m3 = M2 | M1;

function test<T extends keyof E1 = keyof E1>(d: FastEventMessage<E1[T]>): any;
function test<T extends keyof E2 = keyof E2>(d: FastEventMessage<E2[T]>): any;
function test(): any {
    return 1 as any;
}

test({
    type: "a",
    payload: 1,
});
test({
    type: "rooms/sdfds/add",
    payload: "1",
});
test({
    type: "rooms/sdfds/sss",
    payload: "true",
});
