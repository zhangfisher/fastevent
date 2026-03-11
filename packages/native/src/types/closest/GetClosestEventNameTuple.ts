import { GetMatchedEventNames } from "./GetMatchedEventNames";

/**
 *
 *
 * 返回匹配T的所有Key的元素
 *
 * @example
 *
 *
 */
export type GetClosestEventNameTuple<Events extends Record<string, any>, T extends string> =
    | (GetMatchedEventNames<Events, T> extends { 0: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 1: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 2: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 3: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 4: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 5: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 6: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 7: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 8: infer V }
          ? V extends never
              ? never
              : V
          : never)
    | (GetMatchedEventNames<Events, T> extends { 9: infer V }
          ? V extends never
              ? never
              : V
          : never);
