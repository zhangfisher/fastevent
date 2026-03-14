// oxlint-disable no-unused-vars
import { GetClosestEvents } from "./GetClosestEvents";
import { ExpandRecord } from "../utils";
import { ContainsWildcard, FastEventMessage } from "..";
import { ReplaceWildcard } from "../wildcards/ReplaceWildcard";

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
export type GetClosestMessage<
    Events extends Record<string, any>,
    T extends string,
    Meta extends Record<string, any> = never,
> = FastEventMessage<
    ContainsWildcard<T> extends true
        ? ReplaceWildcard<Exclude<ExpandRecord<GetClosestEvents<Events, T>>[0], number | symbol>>
        : T,
    ExpandRecord<GetClosestEvents<Events, T>>[1],
    Meta
>;

type Events = {
    "users/*/login": string;
    "users/*/logout": number;
    "users/*/*": { name: string };
    "*": 1;
    "**": 2;
    "posts/**": 3;
};
type R1 = GetClosestMessage<Events, "users/a/login">;
type R2 = GetClosestMessage<Events, "users/b/logout">;
type R3 = GetClosestMessage<Events, "users/x/y">;
type R4 = GetClosestMessage<Events, "xxxx">;
type R5 = GetClosestMessage<Events, "yyyyy">;
type R6 = GetClosestMessage<Events, "x/1/2/3/4/5">;
type R7 = GetClosestMessage<Events, "posts/1/2/3/4/5">;
type R8 = GetClosestMessage<Events, "*">;
type R9 = GetClosestMessage<Events, "**">;

type XEvents = {
    "users/*/login": string;
    "users/*/logout": number;
    "users/*/*": { name: string };
};
type X1 = GetClosestMessage<XEvents, "sdfds">;
type X2 = GetClosestMessage<XEvents, "sdfd/b/logout">;
type X3 = GetClosestMessage<XEvents, "dfsd/x/y">;
type X4 = GetClosestMessage<XEvents, "xxxx">;
type X5 = GetClosestMessage<XEvents, "**">;
