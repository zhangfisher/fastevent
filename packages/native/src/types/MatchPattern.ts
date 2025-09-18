// MergeUnion<{ a: 1 } | { b: 2 }> === { a: 1, b: 2 }
export type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer U) => void ? { [K in keyof U]: U[K] } : never;

type Split<S extends string, Delimiter extends string = '/'> = S extends `${infer Head}${Delimiter}${infer Tail}` ? [Head, ...Split<Tail, Delimiter>] : [S];

// 匹配单个段
type MatchSegment<Input extends string, Pattern extends string> = Pattern extends '*' ? true : Pattern extends '**' ? true : Input extends Pattern ? true : false;

// 递归匹配数组
type MatchPatternArray<InputArr extends string[], PatternArr extends string[]> = InputArr extends [infer InputHead extends string, ...infer InputTail extends string[]]
    ? PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
        ? PatternHead extends '**'
            ? // 双星通配符可以匹配0个或多个段
              MatchPatternArray<InputTail, PatternTail> extends true
                ? true
                : MatchPatternArray<InputTail, PatternArr> extends true
                ? true
                : MatchPatternArray<InputArr, PatternTail> extends true
                ? true
                : false
            : MatchSegment<InputHead, PatternHead> extends true
            ? MatchPatternArray<InputTail, PatternTail>
            : false
        : false // 输入还有剩余但模式已用完
    : PatternArr extends [infer PatternHead extends string, ...infer PatternTail extends string[]]
    ? PatternHead extends '**'
        ? MatchPatternArray<InputArr, PatternTail> // 双星可以匹配0个段
        : false // 模式还有剩余但输入已用完
    : true; // 两者都匹配完毕

// 主匹配函数
type MatchPattern<T extends string, Pattern extends string> = MatchPatternArray<Split<T>, Split<Pattern>> extends true ? { [K in Pattern]: any } : never;

type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
    ? F // 处理undefined情况
    : T; // 否则返回原类型

export type MatchEventType<T extends string, Events extends Record<string, any>> = MergeUnion<
    Fallback<
        {
            [K in keyof Events]: MatchPattern<T, K & string> extends never ? never : { [P in K]: Events[K] };
        }[keyof Events] extends infer Result
            ? Result extends Record<string, any>
                ? Result
                : Record<string, any>
            : Record<string, any>,
        {
            [K in T]: any;
        }
    >
>;

export type MatchEventPayload<Events extends Record<string, any>, T> = T extends keyof Events
    ? Events[T]
    : T extends string
    ? T extends keyof MatchEventType<T, Events>
        ? MatchEventType<T, Events>[T]
        : any
    : any;
