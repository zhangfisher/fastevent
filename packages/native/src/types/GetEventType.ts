import { GetMatchedEvents } from "./WildcardEvents";

// 从 TransformedEvents 中获取事件类型（支持通配符匹配）

// export type GetEventType<TransformedEvents extends Record<string, any>, T extends string> =
//     // 使用 WildcardEvents 来匹配事件键
//     GetMatchedEvents<TransformedEvents, T> extends infer Matched
//         ? Matched extends Record<string, any>
//             ? {
//                   [K in keyof Matched]: Matched[K];
//               }[keyof Matched]
//             : never
//         : never;
