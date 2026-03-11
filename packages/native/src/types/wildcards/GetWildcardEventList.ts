import { NormalEvents } from "./NormalEvents";
import { WildcardEvents } from "./WildcardEvents";

/**
 *
 * 输入原始事件类型定义
 *
 */

export type GetWildcardEventList<Events extends Record<string, any>> = {
    wildcard: WildcardEvents<Events>;
    normal: NormalEvents<Events>;
};
