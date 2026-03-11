import { GetClosedEvents } from "../GetClosedEvents";
import { ExpandRecord } from "../utils";

export type GetClosedEventDefine<
    Events extends Record<string, any>,
    T extends string,
    D = any,
> = ExpandRecord<GetClosedEvents<Events, T>>;
