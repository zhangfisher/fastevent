import { FastMessagePayload } from "../FastEventMessages";
import { ExpandWildcard } from "../wildcards/ExpandWildcard";

export type PickTransformedEvents<T extends Record<string, any>> = ExpandWildcard<{
    [key in keyof T as T[key] extends FastMessagePayload<any> ? key : never]: T[key];
}>;
