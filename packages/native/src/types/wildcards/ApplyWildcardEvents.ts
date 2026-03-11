// oxlint-disable no-unused-vars
import { ReplaceWildcard } from "./ReplaceWildcard";
import { IsMultiWildcard, KeyOf } from "../utils";

/**
 * 将事件的所有应用通配符
 *
 * 将所有健中的通配符转换为${string}
 *
 */
export type ApplyWildcardEvents<Events extends Record<string, any>> = {
    [K in KeyOf<Events> as IsMultiWildcard<K> extends true
        ? `${string}/${string}`
        : ReplaceWildcard<K>]: Events[K];
};

// type Events = {
//     "users/*/login": { userId: number };
//     "users/*/logout": { userId: number };
//     "users/*/*": { name: string; action: string };
//     "**": Record<string, any>;
//     "*": { catchAll: true };
// };
// type FEvents = ApplyWildcardEvents<Events>;
