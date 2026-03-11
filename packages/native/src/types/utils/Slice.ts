import { Decrement } from "./Decrement";

// 获取数组的切片（从指定索引开始）
export type Slice<
    T extends any[],
    Start extends number,
    Result extends any[] = [],
> = Start extends 0
    ? T
    : T extends [infer _First, ...infer Rest]
      ? Slice<Rest, Decrement<Start>, Result>
      : Result;
