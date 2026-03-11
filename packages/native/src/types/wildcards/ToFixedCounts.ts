import { GetPartCount } from ".";

export type ToFixedCounts<T extends any[]> = {
    [i in keyof T]: GetPartCount<T[i]>;
};
