import { describe, test, expect } from "vitest";
import { FastEvent } from "../../event";

describe("Symbol.dispose", () => {
    test("普通订阅者应支持 Symbol.dispose", () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        const subscriber = emitter.on("test", ({ type }) => {
            events.push(type);
        });

        // 验证订阅者工作正常
        emitter.emit("test");
        expect(events).toEqual(["test"]);

        // 使用 Symbol.dispose 释放订阅
        subscriber[Symbol.dispose]();

        // 验证订阅已被取消
        emitter.emit("test");
        expect(events).toEqual(["test"]);
    });

    test("可迭代订阅者应支持 Symbol.dispose", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 发送一些消息
        emitter.emit("test", 1);
        emitter.emit("test", 2);

        const messages: number[] = [];
        // 先迭代获取第一条消息
        for await (const message of subscriber) {
            messages.push(message.payload);
            if (messages.length >= 1) break;
        }

        // 使用 Symbol.dispose 释放订阅
        subscriber[Symbol.dispose]();

        // 发送更多消息（不应该被接收到）
        emitter.emit("test", 3);
        emitter.emit("test", 4);

        expect(messages).toEqual([1]);
    });

    test("Symbol.dispose 应该等同于 off()", () => {
        const emitter = new FastEvent();
        const events1: string[] = [];
        const events2: string[] = [];

        const subscriber1 = emitter.on("test1", ({ type }) => {
            events1.push(type);
        });

        const subscriber2 = emitter.on("test2", ({ type }) => {
            events2.push(type);
        });

        // 使用 off() 方法
        subscriber1.off();

        // 使用 Symbol.dispose
        subscriber2[Symbol.dispose]();

        // 验证两个订阅都被取消
        emitter.emit("test1");
        emitter.emit("test2");

        expect(events1).toEqual([]);
        expect(events2).toEqual([]);
    });

    test("多次调用 Symbol.dispose 应该是安全的", () => {
        const emitter = new FastEvent();
        const events: string[] = [];
        const subscriber = emitter.on("test", ({ type }) => {
            events.push(type);
        });

        emitter.emit("test");
        expect(events).toEqual(["test"]);

        // 多次调用不应该报错
        subscriber[Symbol.dispose]();
        subscriber[Symbol.dispose]();
        subscriber[Symbol.dispose]();

        emitter.emit("test");
        expect(events).toEqual(["test"]);
    });

    test("Symbol.dispose 与 off() 混合使用", () => {
        const emitter = new FastEvent();
        const events: string[] = [];

        const subscriber = emitter.on("test", ({ type }) => {
            events.push(type);
        });

        emitter.emit("test");
        expect(events).toEqual(["test"]);

        // 先调用 Symbol.dispose
        subscriber[Symbol.dispose]();

        // 再调用 off() 也不应该报错
        subscriber.off();

        emitter.emit("test");
        expect(events).toEqual(["test"]);
    });

    test("使用 once 创建的订阅者应支持 Symbol.dispose", () => {
        const emitter = new FastEvent();
        const events: number[] = [];

        const subscriber = emitter.once("test", ({ payload }) => {
            events.push(payload);
        });

        // 使用 Symbol.dispose 提前取消一次性订阅
        subscriber[Symbol.dispose]();

        // 触发事件（不应该被接收，因为订阅已取消）
        emitter.emit("test", 1);
        emitter.emit("test", 2);

        expect(events).toEqual([]);
    });

    test("使用 onAny 创建的订阅者应支持 Symbol.dispose", () => {
        const emitter = new FastEvent();
        const events: string[] = [];

        const subscriber = emitter.onAny(({ type }) => {
            events.push(type);
        });

        emitter.emit("a");
        emitter.emit("b");
        expect(events).toEqual(["a", "b"]);

        // 使用 Symbol.dispose 取消订阅
        subscriber[Symbol.dispose]();

        emitter.emit("c");
        emitter.emit("d");

        expect(events).toEqual(["a", "b"]);
    });

    test("在 scope 中创建的订阅者应支持 Symbol.dispose", () => {
        const emitter = new FastEvent();
        const scope = emitter.scope("app");
        const events: string[] = [];

        const subscriber = scope.on("test", ({ type }) => {
            events.push(type);
        });

        // 触发事件（通过 scope）
        scope.emit("test");
        expect(events).toEqual(["test"]);

        // 使用 Symbol.dispose 取消订阅
        subscriber[Symbol.dispose]();

        // 再次触发事件（不应该被接收）
        scope.emit("test");

        expect(events).toEqual(["test"]);
    });
});
