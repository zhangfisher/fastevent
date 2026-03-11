// oxlint-disable no-unused-vars
import type { UnionToTuple } from "type-fest";
import { IndexOfMin } from "../utils/IndexOfMin";
import { ToKeyPrioritys } from "../wildcards/ToKeyPrioritys";

export type ClosestMatch<T> = UnionToTuple<T>[IndexOfMin<ToKeyPrioritys<UnionToTuple<T>>>];
