import { ContainsWildcard, IfNever, KeyOf } from ".";
import { ReplaceWildcard } from "./wildcards/ReplaceWildcard";

/**
 *
 * - 当K不包括通配符时,直接返回K
 * - 当包括通配符时，返回K | Omit<ReplaceWildcard<K>, K>
 *   这样操作的目的是为了能让IDE提供"users/* /login"并且能适配通配符
 *   如果不这样操作，IDE不会提示
 *
 *
 *
 */
type EnsureEventType<K extends string> =
    ContainsWildcard<K> extends true ? K | ReplaceWildcard<K> : K;

export type MutableMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
    [K in KeyOf<Events>]: {
        type: ReplaceWildcard<K extends "*" ? string : EnsureEventType<K>>;
        payload: IfNever<Events[K], any>;
        meta?: Meta;
    };
}[KeyOf<Events>];

// export type MutableMessage<Events extends Record<string, any>, Meta = Record<string, any>> = {
//     [K in KeyOf<Events>]: {
//         type: ReplaceWildcard<K extends "*" ? string : EnsureEventType<K>>;
//         payload: IfNever<Events[K], any>;
//         meta?: Meta;
//     };
// }[KeyOf<Events>];
