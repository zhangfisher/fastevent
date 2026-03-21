import { describe, test, expect, vi } from "vitest";
import { FastEvent } from "../../event";
import { AbortError, CancelError } from "../../consts";
import { delay } from "../../utils/delay";

describe("FastEvent钩子函数测试", () => {
    test("当添加新的监听器时应该触发onAddListener", () => {
        const onAddBeforeListener = vi.fn();
        const emitter = new FastEvent({
            onAddBeforeListener,
        });

        const listener = () => {};
        emitter.on("test", listener);

        expect(onAddBeforeListener).toHaveBeenCalledTimes(1);
        expect(onAddBeforeListener).toHaveBeenCalledWith("test", listener, {
            count: 0,
            flags: 0,
            prepend: false,
        });
    });

    test("当添加新的监听器时onAddListener返回false取消添加", () => {
        const onAddBeforeListener = vi.fn().mockReturnValue(false);
        const emitter = new FastEvent({
            onAddBeforeListener,
        });

        const listener = () => {};
        try {
            emitter.on("test", listener);
        } catch (e: any) {
            expect(e).toBeInstanceOf(CancelError);
        }
        expect(emitter.listenerCount).toBe(0);
    });
    test("使用onAddBeforeListener将订阅转换到其他emitter", () => {
        const listener = vi.fn();

        const otherEmitter = new FastEvent();

        const emitter = new FastEvent({
            onAddBeforeListener: vi.fn().mockImplementation((type, listener, options) => {
                return otherEmitter.on(type, listener, options);
            }),
        });

        emitter.on("test", listener);
        expect(emitter.listenerCount).toBe(0);
        expect(otherEmitter.listenerCount).toBe(1);

        emitter.emit("test", 1);
        otherEmitter.emit("test", 2);

        expect(listener).toHaveBeenCalledTimes(1);
        // 断言listener被调用时传入一个对象，对象中包括一个payload值=2
        expect(listener).toHaveBeenCalledWith(
            {
                meta: undefined,
                payload: 2,
                type: "test",
            },
            {
                executor: undefined,
            },
        );
    });

    test("当移除监听器时应该触发onRemoveListener", () => {
        const onRemoveListener = vi.fn();
        const emitter = new FastEvent({
            onRemoveListener,
        });

        const listener = () => {};
        const subscriber = emitter.on("test", listener);
        subscriber.off();

        expect(onRemoveListener).toHaveBeenCalledTimes(1);
        expect(onRemoveListener).toHaveBeenCalledWith("test", listener, expect.anything());
    });

    test("当清空所有监听器时应该触发onClearListeners", () => {
        const onClearListeners = vi.fn();
        const emitter = new FastEvent({
            onClearListeners,
        });

        emitter.on("test1", () => {});
        emitter.on("test2", () => {});
        emitter.offAll();

        expect(onClearListeners).toHaveBeenCalledTimes(1);
    });

    test("当监听器执行出错时应该触发onListenerError", () => {
        const onListenerError = vi.fn();
        const emitter = new FastEvent({
            onListenerError,
        });

        const error = new Error("测试错误");
        const listener = () => {
            throw error;
        };

        emitter.on("test", listener);
        emitter.emit("test");

        expect(onListenerError).toHaveBeenCalledTimes(1);
        expect(onListenerError).toHaveBeenCalledWith(
            error,
            listener,
            {
                meta: undefined,
                payload: undefined,
                type: "test",
            },
            {
                executor: undefined,
            },
        );
    });

    test("执行监听器后应该触发onAfterExecuteListener", async () => {
        const onAfterExecuteListener = vi.fn();
        const emitter = new FastEvent({
            onAfterExecuteListener,
        });

        const listener = () => "result";
        emitter.on("test", listener);
        emitter.emit("test", "payload");
        await delay(1);
        expect(onAfterExecuteListener).toHaveBeenCalledTimes(1);
        expect(onAfterExecuteListener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "test",
                payload: "payload",
            }),
            ["result"],
            [{ __listeners: [[listener, 0, 1, undefined, 0]] }],
        );
    });

    test("当onBeforeExecuteListener返回false时应该中止事件执行", () => {
        const onBeforeExecuteListener = vi.fn().mockReturnValue(false);
        const onAfterExecuteListener = vi.fn();
        const listener = vi.fn();

        const emitter = new FastEvent({
            onBeforeExecuteListener,
            onAfterExecuteListener,
        });

        emitter.on("test", listener);

        expect(() => emitter.emit("test", "payload")).toThrow(AbortError);
        expect(onBeforeExecuteListener).toHaveBeenCalledTimes(1);
        expect(onBeforeExecuteListener).toHaveBeenCalledWith(
            expect.objectContaining({
                type: "test",
                payload: "payload",
            }),
            expect.any(Object),
        );
        expect(listener).not.toHaveBeenCalled();
        expect(onAfterExecuteListener).not.toHaveBeenCalled();
    });

    test("多层级事件路径应该正确传递给onAddListener和onRemoveListener", () => {
        const onAddBeforeListener = vi.fn();
        const onRemoveListener = vi.fn();
        const emitter = new FastEvent({
            onAddBeforeListener,
            onRemoveListener,
        });

        const listener = () => {};
        const subscriber = emitter.on("a/b/c", listener);
        subscriber.off();

        expect(onAddBeforeListener).toHaveBeenCalledWith("a/b/c", listener, {
            count: 0,
            flags: 0,
            prepend: false,
        });
        expect(onRemoveListener).toHaveBeenCalledWith("a/b/c", listener, expect.anything());
    });

    test("使用通配符的事件路径应该正确传递给钩子函数", () => {
        const onAddBeforeListener = vi.fn();
        const emitter = new FastEvent({
            onAddBeforeListener,
        });

        const listener = () => {};
        emitter.on("a/*/c", listener);

        expect(onAddBeforeListener).toHaveBeenCalledWith("a/*/c", listener, {
            count: 0,
            flags: 0,
            prepend: false,
        });
    });

    test("当监听器抛出错误且ignoreErrors为false时应该抛出错误", () => {
        const onListenerError = vi.fn();
        const emitter = new FastEvent({
            ignoreErrors: false,
            onListenerError,
        });

        const error = new Error("测试错误");
        const listener = () => {
            throw error;
        };
        emitter.on("test", listener);

        expect(() => emitter.emit("test")).toThrow(error);
        expect(onListenerError).toHaveBeenCalledWith(
            error,
            listener,
            {
                meta: undefined,
                payload: undefined,
                type: "test",
            },
            {
                executor: undefined,
            },
        );
    });

    test("当添加新的监听器时应该触发onAddAfterListener", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener = () => {};
        emitter.on("test", listener);

        // onAddAfterListener 是异步调用的，需要等待
        await delay(1);

        expect(onAddAfterListener).toHaveBeenCalledTimes(1);
        expect(onAddAfterListener).toHaveBeenCalledWith(
            "test",
            expect.objectContaining({
                __listeners: expect.any(Array),
            }),
        );
    });

    test("onAddAfterListener应该在onAddBeforeListener之后执行", async () => {
        const executionOrder: string[] = [];
        const onAddBeforeListener = vi.fn(() => {
            executionOrder.push("before");
        });
        const onAddAfterListener = vi.fn(() => {
            executionOrder.push("after");
        });

        const emitter = new FastEvent({
            onAddBeforeListener,
            onAddAfterListener,
        });

        const listener = () => {};
        emitter.on("test", listener);

        // 等待异步钩子执行
        await delay(1);

        expect(executionOrder).toEqual(["before", "after"]);
        expect(onAddBeforeListener).toHaveBeenCalledTimes(1);
        expect(onAddAfterListener).toHaveBeenCalledTimes(1);
    });

    test("onAddAfterListener接收正确的监听器节点作为参数", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener = () => "result";
        emitter.on("test", listener);

        // 等待异步钩子执行
        await delay(1);

        expect(onAddAfterListener).toHaveBeenCalledTimes(1);

        // 验证节点包含监听器
        const node = onAddAfterListener.mock.calls[0][1];
        expect(node).toHaveProperty("__listeners");
        expect(Array.isArray(node.__listeners)).toBe(true);
        expect(node.__listeners.length).toBeGreaterThan(0);

        // 验证监听器在节点中
        const listenerMeta = node.__listeners.find((meta: any) => meta[0] === listener);
        expect(listenerMeta).toBeDefined();
    });

    test("多层级事件路径应该正确传递给onAddAfterListener", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener = () => {};
        emitter.on("a/b/c", listener);

        // 等待异步钩子执行
        await delay(1);

        expect(onAddAfterListener).toHaveBeenCalledWith(
            "a/b/c",
            expect.objectContaining({
                __listeners: expect.any(Array),
            }),
        );
    });

    test("使用通配符的事件路径应该正确传递给onAddAfterListener", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener = () => {};
        emitter.on("a/*/c", listener);

        // 等待异步钩子执行
        await delay(1);

        expect(onAddAfterListener).toHaveBeenCalledWith(
            "a/*/c",
            expect.objectContaining({
                __listeners: expect.any(Array),
            }),
        );
    });

    test("添加多个监听器时onAddAfterListener应该被调用多次", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener1 = () => {};
        const listener2 = () => {};
        const listener3 = () => {};

        emitter.on("test", listener1);
        emitter.on("test", listener2);
        emitter.on("test", listener3);

        // 等待异步钩子执行
        await delay(1);

        expect(onAddAfterListener).toHaveBeenCalledTimes(3);
    });

    test("onAddAfterListener的调用不影响监听器的正常功能", async () => {
        const onAddAfterListener = vi.fn();
        const emitter = new FastEvent({
            onAddAfterListener,
        });

        const listener = vi.fn(() => "result");
        emitter.on("test", listener);

        // 等待异步钩子执行
        await delay(1);

        emitter.emit("test", "payload");

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(
            {
                meta: undefined,
                payload: "payload",
                type: "test",
            },
            {
                executor: undefined,
            },
        );
    });
});

describe("FastEvent.hooks", () => {
    test("AddBeforeListener HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.AddBeforeListener.push(() => {
            executionOrder.push("hook");
        });

        emitter.on("test", () => {});
        executionOrder.push("after_on");

        // 等待异步 HOOK 执行
        await delay(1);

        // HOOK 应该在 after_on 之后执行（异步）
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("hook"));
    });

    test("AddAfterListener HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook");
        });

        const listener = () => {};
        emitter.on("test", listener);
        executionOrder.push("after_on");

        // 等待异步 HOOK 执行
        await delay(1);

        // HOOK 应该在 after_on 之后执行（异步）
        expect(executionOrder).toEqual(["after_on", "hook"]);
    });

    test("RemoveListener HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.RemoveListener.push(() => {
            executionOrder.push("hook");
        });

        const listener = () => {};
        const subscriber = emitter.on("test", listener);
        subscriber.off();
        executionOrder.push("after_off");

        // 等待异步 HOOK 执行
        await delay(1);

        // HOOK 应该在 after_off 之后执行（异步）
        expect(executionOrder).toEqual(["after_off", "hook"]);
    });

    test("ClearListeners HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.ClearListeners.push(() => {
            executionOrder.push("hook");
        });

        emitter.on("test", () => {});
        emitter.offAll();
        executionOrder.push("after_clear");

        // 等待异步 HOOK 执行
        await delay(1);

        // HOOK 应该在 after_clear 之后执行（异步）
        expect(executionOrder).toEqual(["after_clear", "hook"]);
    });

    test("ListenerError HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.ListenerError.push(() => {
            executionOrder.push("hook");
        });

        const error = new Error("测试错误");
        const listener = () => {
            executionOrder.push("listener");
            throw error;
        };

        emitter.on("test", listener);
        emitter.emit("test");
        executionOrder.push("after_emit");

        // 等待异步 HOOK 执行
        await delay(1);

        // HOOK 应该在 listener 和 after_emit 之后执行（异步）
        expect(executionOrder).toEqual(["listener", "after_emit", "hook"]);
    });

    test("BeforeExecuteListener HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.BeforeExecuteListener.push(() => {
            executionOrder.push("before_hook");
        });

        const listener = () => {
            executionOrder.push("listener");
        };

        emitter.on("test", listener);
        emitter.emit("test");
        executionOrder.push("after_emit");

        // 等待异步 HOOK 执行
        await delay(1);

        // 异步 HOOK 应该在 listener 和 after_emit 之后执行
        expect(executionOrder).toEqual(["listener", "after_emit", "before_hook"]);
    });

    test("AfterExecuteListener HOOK 是异步调用的", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 添加异步 HOOK
        emitter.hooks.AfterExecuteListener.push(() => {
            executionOrder.push("after_hook");
        });

        const listener = () => {
            executionOrder.push("listener");
        };

        emitter.on("test", listener);
        emitter.emit("test");
        executionOrder.push("after_emit");

        // 等待异步 HOOK 执行
        await delay(1);

        // 异步 HOOK 应该在 listener 和 after_emit 之后执行
        expect(executionOrder).toEqual(["listener", "after_emit", "after_hook"]);
    });

    test("多个 HOOK 可以同时注册并按顺序异步执行", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 注册多个异步 HOOK
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook1");
        });
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook2");
        });
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook3");
        });

        const listener = () => {};
        emitter.on("test", listener);
        executionOrder.push("after_on");

        // 等待异步 HOOK 执行
        await delay(1);

        // 所有 HOOK 都应该被执行，且在 after_on 之后
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("hook1"));
        expect(executionOrder.indexOf("hook1")).toBeLessThan(executionOrder.indexOf("hook2"));
        expect(executionOrder.indexOf("hook2")).toBeLessThan(executionOrder.indexOf("hook3"));
    });

    test("不同类型的 HOOK 可以同时注册并异步执行", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 注册不同类型的异步 HOOK
        emitter.hooks.AddBeforeListener.push(() => {
            executionOrder.push("add_before");
        });
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("add_after");
        });
        emitter.hooks.RemoveListener.push(() => {
            executionOrder.push("remove");
        });

        const listener = () => {};
        emitter.on("test", listener);
        executionOrder.push("after_on");

        const subscriber = emitter.on("test2", listener);
        subscriber.off();
        executionOrder.push("after_off");

        // 等待异步 HOOK 执行
        await delay(1);

        // 所有异步 HOOK 都应该在同步操作之后执行
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("add_before"));
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("add_after"));
        expect(executionOrder.indexOf("after_off")).toBeLessThan(executionOrder.indexOf("remove"));
    });

    test("多个 HOOK 可以同时注册并异步执行", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 注册多个异步 HOOK
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook1");
        });
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook2");
        });
        emitter.hooks.AddAfterListener.push(() => {
            executionOrder.push("hook3");
        });

        emitter.on("test", () => {});
        executionOrder.push("after_on");

        // 等待异步 HOOK 执行
        await delay(10);

        // 所有 HOOK 都应该被执行，且在 after_on 之后
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("hook1"));
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("hook2"));
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("hook3"));
    });

    test("异步 HOOK 支持异步函数", async () => {
        const executionOrder: string[] = [];
        const emitter = new FastEvent();

        // 注册异步 HOOK
        emitter.hooks.AddAfterListener.push(async () => {
            // 模拟异步操作
            await new Promise((resolve) => setTimeout(resolve, 10));
            executionOrder.push("async_hook");
        });

        emitter.on("test", () => {});
        executionOrder.push("after_on");

        // 等待异步 HOOK 执行（需要足够的时间）
        await delay(50);

        // 异步 HOOK 应该被执行
        expect(executionOrder).toContain("after_on");
        expect(executionOrder).toContain("async_hook");
        expect(executionOrder.indexOf("after_on")).toBeLessThan(executionOrder.indexOf("async_hook"));
    });

    test("FastEvent.hooks 与 on* 选项的区别：hooks 是异步的，options 是同步的", async () => {
        const hooksExecutionOrder: string[] = [];
        const optionsExecutionOrder: string[] = [];

        // 使用 FastEvent.hooks（异步）
        const emitter1 = new FastEvent();
        emitter1.hooks.AddBeforeListener.push(() => {
            hooksExecutionOrder.push("hook");
        });

        const listener1 = () => {};
        emitter1.on("test", listener1);
        hooksExecutionOrder.push("after_on");

        await delay(1);

        // 使用 onAddBeforeListener 选项（同步）
        const onAddBeforeListener = vi.fn(() => {
            optionsExecutionOrder.push("option");
        });
        const emitter2 = new FastEvent({
            onAddBeforeListener,
        });

        const listener2 = () => {};
        emitter2.on("test", listener2);
        optionsExecutionOrder.push("after_on");

        // hooks 应该是异步的（hook 在 after_on 之后）
        expect(hooksExecutionOrder).toEqual(["after_on", "hook"]);

        // options 应该是同步的（option 在 after_on 之前）
        expect(optionsExecutionOrder).toEqual(["option", "after_on"]);
    });
});
