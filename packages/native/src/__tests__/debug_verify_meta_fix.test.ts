/* eslint-disable no-unused-vars */
import { describe, test } from "vitest";
import type { Equal, Expect } from "@type-challenges/utils";
import { FastEvent } from "../event";
import { FastEventScope } from "../scope";

/**
 * 验证修复：当通过 .scope() 传入 FastEventScope 实例时，
 * message.meta 应该正确合并 Emitter 的 Meta 和 Scope 的 Meta
 */
describe("验证 Meta 类型合并修复", () => {
    test("传入 Scope 实例时应正确合并 Meta", () => {
        // 1. 创建带有自定义 Meta 的 Emitter
        const emitter = new FastEvent({
            meta: {
                root: 100,
            },
        });

        // 验证 emitter.meta 类型正确
        type EmitterMeta = Expect<Equal<typeof emitter.meta, { root: number }>>;

        // 2. 定义 Scope 的自定义 Meta
        type MyScopeMeta = {
            x: number;
            y: string;
            z: boolean;
        };

        type MyScopeEvents = {
            a: number;
            b: string;
        };

        // 3. 创建自定义 Scope 类
        class MyScope extends FastEventScope<MyScopeEvents, MyScopeMeta> {}

        // 4. 通过 .scope() 传入实例
        const myScope = emitter.scope("modules/my", new MyScope());

        // 5. 验证 message.meta 包含了 Emitter 的 Meta 和 Scope 的 Meta
        myScope.on("a", (message) => {
            // 应该能访问 root（来自 Emitter）
            const root: number = message.meta.root;

            // 应该能访问 x, y, z（来自 Scope）
            const x: number = message.meta.x;
            const y: string = message.meta.y;
            const z: boolean = message.meta.z;

            type cases = [
                Expect<Equal<typeof message.type, "a">>,
                Expect<Equal<typeof message.payload, number>>,
                // Meta 应该包含：Emitter Meta & Scope Meta & FastEventMeta & FastEventScopeMeta & Record<string, any>
                Expect<
                    Equal<
                        typeof message.meta,
                        { root: number } & MyScopeMeta & { scope: string } & Record<string, any>
                    >
                >,
            ];
        });
    });

    test("传入配置对象时也应正确合并 Meta", () => {
        const emitter = new FastEvent({
            meta: {
                root: 100,
            },
        });

        const scope = emitter.scope("a/b/c", {
            meta: { c: 1 },
        });

        scope.on("a/b/c", (message) => {
            type cases = [
                Expect<
                    Equal<
                        typeof message.meta,
                        { root: number } & { c: number } & { scope: string } & Record<string, any>
                    >
                >,
            ];
        });
    });
});
