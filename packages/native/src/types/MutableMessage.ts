import { IfNever, KeyOf } from ".";
import { ReplaceWildcard } from "./wildcards/ReplaceWildcard";

export type MutableMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in KeyOf<Events>]: {
        type: K extends "*" ? string : ReplaceWildcard<K>;
        payload: IfNever<Events[K], any>;
        meta?: Meta;
    };
}[KeyOf<Events>];
