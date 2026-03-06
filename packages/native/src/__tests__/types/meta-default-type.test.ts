/* eslint-disable no-unused-vars */

import { describe, test, expect } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { TypedFastEventMessage, FastEventMeta } from "../../types";

/**
 * Meta 默认类型验证测试
 *
 * @description
 * 验证 TypedFastEventMessage 的 meta 字段默认类型是否为 FastEventMeta & Record<string, any>
 * 而不是 any
 */
describe("Meta 默认类型验证", () => {
    test("当不提供 Meta 参数时，meta 应该是 FastEventMeta & Record<string, any>", () => {
        type Message = TypedFastEventMessage<{ test: string }>;

        const message: Message = {
            type: "test",
            payload: "test",
            meta: {
                // 可以包含任意属性（Record<string, any>）
                customProperty: "test",
                anotherProperty: 123,
                nestedObject: { key: "value" },
            },
        };

        // 验证 meta 的类型
        type MetaType = typeof message.meta;
        type ExpectedMetaType = FastEventMeta & Record<string, any>;

        // 这个类型检查应该通过
        type TypeTest = [Expect<Equal<MetaType, ExpectedMetaType>>];
    });

    test("当提供自定义 Meta 时，meta 应该包含自定义类型", () => {
        type CustomMeta = {
            timestamp: number;
            userId: string;
        };

        type Message = TypedFastEventMessage<{ test: string }, CustomMeta>;

        const message: Message = {
            type: "test",
            payload: "test",
            meta: {
                timestamp: Date.now(),
                userId: "user123",
                // 同时可以包含其他属性（Record<string, any>）
                extraProperty: "extra",
            },
        };

        // 验证 meta 的类型
        type MetaType = typeof message.meta;
        type ExpectedMetaType = FastEventMeta & CustomMeta & Record<string, any>;

        type TypeTest = [Expect<Equal<MetaType, ExpectedMetaType>>];
    });

    test("meta 不应该是 any 类型", () => {
        type Message = TypedFastEventMessage<{ test: string }>;

        // 这个测试验证 meta 不是 any 类型
        type MetaType = Message extends { meta: infer M } ? M : never;

        // 如果 MetaType 是 any，则这个类型检查会失败
        type IsNotAny = [any] extends [MetaType] ? true : false;

        // 我们期望 IsNotAny 为 false（即 meta 不是 any）
        type TypeTest = [Expect<Equal<IsNotAny, false>>];
    });

    test("验证 meta 类型可以安全地访问属性", () => {
        type Message = TypedFastEventMessage<{ test: string }>;

        const message: Message = {
            type: "test",
            payload: "test",
            meta: {
                anyProperty: "value",
            },
        };

        // 验证可以安全地访问 meta 的属性
        const _property = message.meta.anyProperty;
        type PropertyType = typeof _property;

        // 由于 meta 是 Record<string, any>，属性类型应该是 any
        type TypeTest = [Expect<Equal<PropertyType, any>>];
    });
});

/**
 * 说明：
 *
 * 修改前（M = any）：
 * - meta 的类型是：FastEventMeta & any & Record<string, any>
 * - 简化为：any（因为 any & 任何类型 = any）
 *
 * 修改后（使用 IsAny 判断）：
 * - 当 M = any 时，meta 的类型是：FastEventMeta & Record<string, any>
 * - 当 M 是具体类型时，meta 的类型是：FastEventMeta & M & Record<string, any>
 *
 * 这样确保了 meta 的默认类型是类型安全的，而不是 any。
 */
