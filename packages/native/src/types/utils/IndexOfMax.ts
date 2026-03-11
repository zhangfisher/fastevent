import { Max } from "./Max";

// 获取元组中最大值的索引
export type IndexOfMax<T extends number[], M = Max<T>, Idx extends any[] = []> = T extends [
    infer F,
    ...infer R extends number[],
]
    ? F extends M
        ? Idx["length"]
        : IndexOfMax<R, M, [...Idx, any]>
    : never;
