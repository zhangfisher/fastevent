import { Equal } from "./Equal";

export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;
