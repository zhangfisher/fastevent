export type KeyOf<T extends Record<string, any>> =
    Exclude<keyof T, number | symbol> extends never ? string : Exclude<keyof T, number | symbol>;
