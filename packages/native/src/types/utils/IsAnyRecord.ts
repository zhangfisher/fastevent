import { StrictEqual } from "./StrictEqual";

export type IsAnyRecord<T> = StrictEqual<T, Record<string, any>>;
