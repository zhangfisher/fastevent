import { ClosestMatch } from "./ClosestMatch";
import { GetMatchedEventNames } from "./GetMatchedEventNames";
import { GetClosestEventNameTuple } from "./GetClosestEventNameTuple";

/**
 * 返回最接近的Key
 */

export type GetClosestEventName<Events extends Record<string, any>, T extends string> =
    GetMatchedEventNames<Events, T> extends never
        ? never
        : ClosestMatch<GetClosestEventNameTuple<Events, T>>;
