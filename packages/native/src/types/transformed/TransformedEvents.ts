import { NotPayload } from "./NotPayload";

// 将事件类型所有成员转换为NotPayload ExtendWildcardEvents

export type TransformedEvents<Events extends Record<string, any>> = {
    [K in keyof Events]: NotPayload<Events[K]>;
};
