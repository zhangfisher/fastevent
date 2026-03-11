import { Min } from "./Min";

// 获取元组中最小值的索引
export type IndexOfMin<T extends number[], M = Min<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[],
]
    ? F extends M
        ? Idx["length"]
        : IndexOfMin<R, M, [...Idx, any]>
    : never;
