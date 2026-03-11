/**
 * 当类型为 never 或 undefined 时返回默认值
 * @description 如果 T 是 never 或 undefined，返回默认值 F；否则返回原类型 T
 * @example
 * type Result1 = Fallback<never, string>;
 * // Result1 = string
 * type Result2 = Fallback<number, string>;
 * // Result2 = number
 * type Result3 = Fallback<undefined, string>;
 * // Result3 = string
 */
export type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
      ? F // 处理undefined情况
      : T; // 否则返回原类型
