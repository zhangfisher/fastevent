export type Merge<T extends object, U extends object> = {
    [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};
