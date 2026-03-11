import { ClosestMatch } from "./ClosestMatch";
import { GetClosedEventKeys } from "./GetClosedEventKeys";
import { GetMatchedEventKeys } from "./GetMatchedEventKeys";

/**
 * 返回最接近的Key
 */

export type GetRecommendEventKey<Events extends Record<string, any>, T extends string> =
    GetClosedEventKeys<Events, T> extends never
        ? never
        : ClosestMatch<GetMatchedEventKeys<Events, T>>;
