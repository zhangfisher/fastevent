import { StrictEqual } from "./StrictEqual";

export type IsStrictRecord<T> = StrictEqual<T, Record<string, any>>;
