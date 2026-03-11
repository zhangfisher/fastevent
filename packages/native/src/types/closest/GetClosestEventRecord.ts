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
    D = any,
> = ExpandRecord<GetClosestEvents<Events, T>>;

// type Events = {
//     "users/*/login": string;
//     "users/*/logout": number;
//     "users/*/*": { name: string };
// };

// type Result = GetClosestEventTuple<Events, "users/fisher/login">;
