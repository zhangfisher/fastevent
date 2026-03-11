import type { Subtract } from "type-fest";
import { IsMultiWildcard, PrefixNumber } from "../utils";
import { GetPartCount, GetWildcardCount } from ".";

/**
 * 计算输入的Key元组的优先级元组
 *
 * 用于匹配时使用
 */

export type ToKeyPrioritys<T extends any[]> = {
    [i in keyof T]: IsMultiWildcard<T[i]> extends true
        ? PrefixNumber<Subtract<10, GetPartCount<T[i]>>, 99>
        : GetWildcardCount<T[i]>;
};
