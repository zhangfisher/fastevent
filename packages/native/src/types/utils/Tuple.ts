export type Tuple<T extends number, R extends unknown[] = []> = R["length"] extends T
    ? R
    : Tuple<T, [...R, unknown]>;
