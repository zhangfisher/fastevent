import { GetClosestEventTuple } from "./GetClosestEventRecord";

export type GetClosestEventPayload<
    Events extends Record<string, any>,
    T extends string,
> = GetClosestEventTuple<Events, T>[1];
