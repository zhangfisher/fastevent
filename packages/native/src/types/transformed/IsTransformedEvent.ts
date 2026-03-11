import { GetClosestEventPayload } from "../closest";
import { FastMessagePayload } from "../FastEventMessages";
import { IsAny } from "../utils";

export type IsTransformedEvent<
    Events extends Record<string, any>,
    T extends string,
> = T extends keyof Events
    ? IsAny<Events[T]> extends true
        ? never
        : Events[T] extends FastMessagePayload<any>
          ? T
          : never
    : IsAny<GetClosestEventPayload<Events, T>> extends true
      ? never
      : GetClosestEventPayload<Events, T> extends FastMessagePayload<any>
        ? T
        : never;

// export type IsTransformedEvent<Events extends Record<string, any>, T extends string> =
//     // 优先检查：如果 T 是 Events 的精确键，其值必须扩展 FastMessagePayload
//     T extends keyof Events
//         ? IsAny<Events[T]> extends true
//             ? never
//             : Events[T] extends FastMessagePayload<any>
//               ? T
//               : never
//         : GetClosestEvents<Events, Exclude<T, number | symbol>> extends infer ClosestEvent
//           ? ClosestEvent extends Record<string, any>
//               ? IsAny<ClosestEvent[keyof ClosestEvent]> extends true
//                   ? never
//                   : ClosestEvent[keyof ClosestEvent] extends FastMessagePayload<any>
//                     ? T
//                     : never
//               : never
//           : never;
