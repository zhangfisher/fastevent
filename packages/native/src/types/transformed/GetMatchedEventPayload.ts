import { GetMatchedEvents } from "../WildcardEvents";

// 专用的类型查询工具，使用原始事件类型

export type GetMatchedEventPayload<Events extends Record<string, any>, T extends string> =
    // 使用 WildcardEvents 来匹配事件，返回原始类型
    GetMatchedEvents<Events, T> extends infer Matched
        ? Matched extends { [key: string]: any }
            ? // GetMatchedEvents 现在返回交集类型，需要转换为联合类型
              {
                  [K in keyof Matched]: Matched[K];
              }[keyof Matched]
            : never
        : never;
