import { Tuple } from "./Tuple";

export type Add<A extends number, B extends number> = [...Tuple<A>, ...Tuple<B>]["length"];
