// oxlint-disable no-unused-vars
/**
 * 测试触发事件时传递AbortSignal参数给监听器
 */

import { describe, test, expect, vi } from "bun:test";
import { FastEvent } from "../../event";
import type { FastEventListenerArgs, FastEventMessage } from "../../types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("通过装饰器方式进行订阅", () => {
    test("简单的装饰器订阅方式", () => {
        type Events = {
            click: number;
            mousemove: { x: number; y: number };
        };
        const emitter = new FastEvent();

        class MyClass {
            @emitter.on("test")
            onMessage(message: FastEventMessage, args: FastEventListenerArgs) {
                return message.type;
            }
        }

        const results = emitter.emit("test", 1);
    });
});
