import { AssertString } from "./utils";
import { GetRecommendEventKey } from "./GetRecommendEventKey";

export type GetClosedEvents<
    Events extends Record<string, any>,
    T extends string,
    D = Record<string, any>,
> =
    GetRecommendEventKey<Events, T> extends never
        ? D
        : Record<
              AssertString<GetRecommendEventKey<Events, T>>,
              Events[AssertString<GetRecommendEventKey<Events, T>>]
          >;
