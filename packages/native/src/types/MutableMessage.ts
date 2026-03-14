// oxlint-disable no-unused-vars
import {
    ContainsWildcard,
    FastEventMessage,
    FastMessagePayload,
    IfNever,
    KeyOf,
    IsStrictRecord,
    FastEventMessageExtends,
} from ".";
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

export type MutableMessage<
    Events extends Record<string, any>,
    Meta extends Record<string, any> = never,
> =
    IsStrictRecord<Events> extends true
        ? FastEventMessage<string, any, Meta>
        : {
              [K in KeyOf<Events>]: Events[K] extends FastMessagePayload
                  ? IfNever<Events[K]["type"], any>
                  : {
                        type: ReplaceWildcard<K extends "*" ? string : EnsureEventType<K>>;
                        payload: IfNever<Events[K], any>;
                        meta?: Meta;
                    } & FastEventMessageExtends;
          }[KeyOf<Events>];

// import { FastEventIterator } from "../utils/eventIterator";

// type Events = {
//     "users/*/login": string;
//     "*": { data: number };
//     "**": Record<string, any>;
// };
// type IteratorMessage<T> = T extends FastEventIterator<infer M> ? M : never;

// type Messages = MutableMessage<Events>;
// type Iters = FastEventIterator<Messages>;
// type IMessages = IteratorMessage<Iters>;

// type Iter1 = FastEventIterator<{
//     type: string;
//     payload: {
//         data: number;
//     };
//     meta?: undefined;
// }>;
// type Iter2 = FastEventIterator<{
//     type: `${string}/${string}`;
//     payload: Record<string, any>;
//     meta?: undefined;
// }>;
// type Iter3 = FastEventIterator<{
//     type: `users/${string}/login`;
//     payload: string;
//     meta?: undefined;
// }>;

// async function test() {
//     const x: Iters = null as unknown as Iters;
//     for await (const msg of x) {
//         if (msg.type === "users/fisher/login") {
//             msg.payload;
//         }
//     }
// }

// type Messages1 = MutableMessage<{}>;
// type Messages2 = MutableMessage<never>;
// type Messages3 = MutableMessage<Record<string, any>>;
