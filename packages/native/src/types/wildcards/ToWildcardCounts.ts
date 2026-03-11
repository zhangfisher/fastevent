import { GetWildcardCount } from ".";

export type ToWildcardCounts<T extends any[]> = {
    [i in keyof T]: GetWildcardCount<T[i]>;
};
