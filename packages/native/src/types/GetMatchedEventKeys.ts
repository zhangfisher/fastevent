import { GetClosedEventKeys } from "./GetClosedEventKeys";

/**
 * 返回匹配T的所有Key
 *
 * @example
 *
 *
 */

export type GetMatchedEventKeys<Events extends Record<string, any>, T extends string> =
    GetClosedEventKeys<Events, T> extends { 0: infer V } ? (V extends never ? never : V) : never;
