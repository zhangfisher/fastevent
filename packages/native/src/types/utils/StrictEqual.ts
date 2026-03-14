export type StrictEqual<A, B> =
    (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

// type x1 = StrictEqual<Record<string, any>, Record<string, any>>;
// type x2 = StrictEqual<{}, Record<string, any>>;
// type x3 = StrictEqual<{ a: boolean }, Record<string, any>>;
// type x4 = StrictEqual<{ [x: string]: boolean }, Record<string, any>>;
// type x5 = StrictEqual<{ [x: string]: any } & { [x: `${string}`]: any }, Record<string, any>>;
