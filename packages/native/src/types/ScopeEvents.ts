import { Split } from "./utils/Split";
import { Join } from "./utils/Join";
import { Slice } from "./utils/Slice";

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

/**
 *
 * 返回指定前缀的作用域事件列表
 *
 * - 当 Prefix = '' 时，直接返回 Events
 * - 当没有事件匹配 Prefix 时，返回 Default
 *
 */
export type ScopeEvents<
    Events extends Record<string, any>,
    Prefix extends string,
    Default extends Record<string, any> = Record<string, any>,
> = Prefix extends ""
    ? Events
    : [keyof ScopeEventsImpl<Events, Prefix>] extends [never]
      ? Default
      : ScopeEventsImpl<Events, Prefix>;
