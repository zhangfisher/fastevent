/**
 * 提取键中不包含分隔符的记录
 * @description 从对象类型中提取出键不包含 "/" 分隔符的属性
 * @example
 * type Result = PickNotInlcudeDelimiterRecord<{ "user/login": 1; logout: 2 }>;
 * // Result = { logout: 2 }
 */
export type PickNotInlcudeDelimiterRecord<R extends Record<string, any>> = {
    [K in keyof R as K extends `${string}/${string}` ? never : K]: R[K];
};
