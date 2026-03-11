import { FastMessagePayload } from "../FastEventMessages";

/**
 * 检查事件对象的所有值是否都为 FastMessagePayload 类型
 * @description
 * - 如果 Events 为空对象，返回 false
 * - 如果所有值都 extends FastMessagePayload，返回 true
 * - 否则返回 false
 *
 * @example
 * type Test1 = IsTransformed<{ a: FastMessagePayload<string> }>; // true
 * type Test2 = IsTransformed<{ a: FastMessagePayload<string>; b: number }>; // false
 * type Test3 = IsTransformed<{}>; // false
 */

export type IsAllTransformed<Events extends Record<string, any>> = keyof Events extends never
    ? false
    : {
            [K in keyof Events]: Events[K] extends FastMessagePayload<any> ? true : false;
        }[keyof Events] extends infer Result
      ? [Result] extends [true]
          ? true
          : false
      : false;
