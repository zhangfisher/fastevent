import { ValueOf } from "type-fest";
import { ReplaceWildcard } from "./ReplaceWildcard";

export type ToWildcardMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in keyof Events]: {
        type: ReplaceWildcard<Exclude<K, number | symbol>>;
        payload: ValueOf<Events[K]>;
        meta?: Meta;
    };
}[keyof Events];
