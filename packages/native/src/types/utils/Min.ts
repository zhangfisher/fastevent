import type { LessThan } from "type-fest";

// 获取元组中的最小值
export type Min<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R]
    ? F extends number
        ? R extends number[]
            ? LessThan<F, M> extends true
                ? Min<R, F>
                : Min<R, M>
            : M
        : M
    : M;
