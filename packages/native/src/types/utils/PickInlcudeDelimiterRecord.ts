/**
 * 提取键中包含分隔符的记录
 * @description 从对象类型中提取出键包含 "/" 分隔符的属性
 * @example
 * type Result = PickInlcudeDelimiterRecord<{ "user/login": 1; logout: 2 }>;
 * // Result = { "user/login": 1 }
 */
export type PickInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? K : never]: R[K];
};
