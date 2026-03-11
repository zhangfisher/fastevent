import { AssertRecord, RemoveEmptyObject } from "../utils";
import { ReplaceWildcard } from "./ReplaceWildcard";

/**
 * 扩展通配符事件类型
 * @description 将包含通配符的事件键扩展为模板字面量类型
 *
 * 优先级：非通配符键 > 单级通配符 > 多级通配符
 * 使用交叉类型实现，确保精确键优先匹配
 */

export type ExtendWildcardEvents<Events extends Record<string, any>> = AssertRecord<
    RemoveEmptyObject<
        {
            [K in keyof Events as K extends `${string}*${string}` | `*` ? never : K]: Events[K];
        } & {
            [K in keyof Events as K extends `${string}*${string}` | `*`
                ? ReplaceWildcard<K & string>
                : never]: Events[K];
        }
    >
>;
