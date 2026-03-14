import { GetClosestEvents } from "./GetClosestEvents";
import { ExpandRecord } from "../utils";

/**
 * 返回最匹配的事件元组
 * 
 * [事件名称，事件负载]
 *
 * type Events = {
  *   "users/* /login": string;
    "users/* /logout": number;
    "users/* /*": { name: string };
};
 
type Result =GetClosestEventTuple<Events,"users/fisher/login"> 
type Result = ["users/* /login", string]

 *
 */
export type GetClosestEventTuple<
    Events extends Record<string, any>,
    T extends string,
> = ExpandRecord<GetClosestEvents<Events, T>>;

// import { ReplaceWildcard } from "../wildcards/ReplaceWildcard";

// type Events = {
//     "users/*/login": string;
//     "users/*/logout": number;
//     "users/*/*": { name: string };
// };

// type T = keyof Events;
// function test<T extends keyof Events = keyof Events>(type: ReplaceWildcard<T> | T) {
//     return null as unknown as GetClosestEventTuple<Events, T>;
// }
// const R2 = test("users/a/login");
// type Result = GetClosestEventTuple<Events, T>;
