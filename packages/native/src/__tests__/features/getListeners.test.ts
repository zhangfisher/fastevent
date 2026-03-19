import { describe, test, expect } from "vitest";
import { FastEvent } from "../../event";

describe("getListeners", async () => {
    test("获取指定type监听器", () => {
        const emitter = new FastEvent();
        emitter.on("x", () => {});
        const listeners = emitter.getListeners("x");
        expect(listeners.length).toBe(1);
    });
    test("获取指定type多个监听器", () => {
        const emitter = new FastEvent();
        emitter.on("x", () => {});
        emitter.on("x", () => {});
        emitter.on("x", () => {});
        const listeners = emitter.getListeners("x");
        expect(listeners.length).toBe(3);
    });
    test("获取包括onAny时type多个监听器", () => {
        const emitter = new FastEvent();
        emitter.on("x", () => {});
        emitter.on("x", () => {});
        emitter.on("x", () => {});
        emitter.onAny(() => {});
        const listeners = emitter.getListeners("x");
        expect(listeners.length).toBe(4);
    });
    test("含通配符时的监听器", () => {
        const emitter = new FastEvent();

        const events: string[] = [];
        emitter.on("a/*", ({ type }) => {
            events.push(type);
        });
        emitter.onAny(({ type }) => {
            events.push(type);
        });
        const listeners = emitter.getListeners("a/c");
        expect(listeners.length).toBe(2);
    });
});
