/**
 * 将事件映射转换为可变联合类型
 * 根据事件的键名确定 type 字段，根据事件的值确定 payload 字段
 *
 * @example
 * ```ts
 * type Events = {
 *   a: number;
 *   b: boolean;
 * };
 *
 * type Result = MutableEvents<Events>;
 * // Result = { type: "a"; payload: number } | { type: "b"; payload: boolean }
 * ```
 */
export type MutableRecord<
    Items,
    KindKey extends string = "type",
    Share = unknown,
    DefaultKind extends keyof Items = never,
> =
    | { [Kind in keyof Items]: Union<{ [type in KindKey]: Kind } & Items[Kind] & Share> }[Exclude<
          keyof Items,
          DefaultKind
      >]
    | (DefaultKind extends never
          ? never
          : Union<{ [K in KindKey]?: DefaultKind | undefined } & Items[DefaultKind] & Share>);

import { Union } from "./Union";
