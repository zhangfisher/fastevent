export type ItemOf<T extends any[]> = T extends (infer I)[] ? I : never;
