import { GetClosestEventTuple } from "../closest/GetClosestEventRecord";
/**
 * 获取指定事件名称的负载类型
 */
export type GetPayload<Events extends Record<string, any>, T extends string> = GetClosestEventTuple<
    Events,
    T
>[1];
