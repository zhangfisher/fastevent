import { IsNever } from "./IsNever";

/**
 * 如果类型为 never，返回默认值；否则返回原类型
 * @description 条件类型工具，当类型为 never 时提供默认值
 * @example
 * type Result1 = IfNever<never, string>;
 * // Result1 = string
 * type Result2 = IfNever<number, string>;
 * // Result2 = number
 */
export type IfNever<T, Default> = IsNever<T> extends true ? Default : T;
