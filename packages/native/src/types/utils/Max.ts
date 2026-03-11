import type { LessThan } from "type-fest";

export type Max<T extends number[], M extends number = T[0]> = T extends [infer F, ...infer R]
    ? F extends number
        ? R extends number[]
            ? LessThan<F, M> extends true
                ? Max<R, M>
                : Max<R, F>
            : M
        : M
    : M;
