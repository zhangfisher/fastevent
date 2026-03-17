// oxlint-disable no-unused-expressions
// oxlint-disable no-unused-vars
import { describe, test, expect, vi } from "bun:test";
import { FastEvent } from "../../event";
import { queue } from "../../pipes";
import { NotPayload } from "../../types/transformed/NotPayload";
import { AbortError } from "../../consts";

describe("FastEvent 异步迭代器基础功能", () => {
    test("应该支持 for await...of 语法", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        emitter.emit("test", "message1");
        emitter.emit("test", "message2");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 2) break;
        }

        expect(messages).toHaveLength(2);
        expect(messages[0]).toEqual({
            type: "test",
            payload: "message1",
        });
        expect(messages[1]).toEqual({
            type: "test",
            payload: "message2",
        });
    });
    test("启用事件转换应该支持 for await...of 语法", async () => {
        type TEvents = {
            test: NotPayload<string>;
        };
        const emitter = new FastEvent<TEvents>({
            transform: (message) => {
                return message.payload;
            },
        });
        const subscriber = emitter.on("test");

        emitter.emit("test", "message1");
        emitter.emit("test", "message2");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 2) break;
        }

        expect(messages).toHaveLength(2);

        expect(messages[0]).toEqual("message1");
        expect(messages[1]).toEqual("message2");
    });
    test("emit 在迭代之前发送的消息应该被 queue 缓存", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 在迭代之前发送多条消息
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");
        emitter.emit("test", "message3");

        // 验证消息被 queue 缓存，不会丢失
        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 3) break;
        }

        expect(messages).toHaveLength(3);
        expect(messages[0].payload).toBe("message1");
        expect(messages[1].payload).toBe("message2");
        expect(messages[2].payload).toBe("message3");
    });

    test("迭代过程中发送的新消息应该能正常接收", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        const messages = [];

        // 在迭代过程中发送消息
        const iterator = subscriber[Symbol.asyncIterator]();

        // 发送第一条消息并接收
        emitter.emit("test", "message1");
        const result1 = await iterator.next();
        messages.push(result1.value);
        expect(result1.value.payload).toBe("message1");

        // 发送第二条消息并接收
        emitter.emit("test", "message2");
        const result2 = await iterator.next();
        messages.push(result2.value);
        expect(result2.value.payload).toBe("message2");

        expect(messages).toHaveLength(2);
    });

    test("应该在 off() 后停止接收新消息", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        emitter.emit("test", "before");
        subscriber.off();
        subscriber.on();
        emitter.emit("test", "after");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        expect(messages).toHaveLength(1);
        expect(messages[0].payload).toBe("after");
    });

    test("不启用 iterable 时应该返回普通订阅者", () => {
        const emitter = new FastEvent();
        const listener = (msg: any) => {};
        const subscriber = emitter.on("test", listener);

        // 应该有 off 和 listener 属性
        expect(typeof subscriber.off).toBe("function");
        expect(subscriber.listener).toBe(listener);

        // 不应该有异步迭代器
        expect(Symbol.asyncIterator in subscriber).toBe(false);
    });

    test("on 方法不提供 listener 时应该返回异步迭代器", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 应该有异步迭代器
        expect(Symbol.asyncIterator in subscriber).toBe(true);
        expect(typeof subscriber.off).toBe("function");

        // 验证可以使用 for await...of
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 2) break;
        }

        expect(messages).toHaveLength(2);
        expect(messages[0].payload).toBe("message1");
        expect(messages[1].payload).toBe("message2");
    });

    test("onAny 不提供 listener 时应该返回异步迭代器", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.onAny();

        // 应该有异步迭代器
        expect(Symbol.asyncIterator in subscriber).toBe(true);
        expect(typeof subscriber.off).toBe("function");

        // 验证可以使用 for await...of 接收所有事件
        emitter.emit("event1", "data1");
        emitter.emit("event2", "data2");
        emitter.emit("event3", "data3");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 3) break;
        }

        expect(messages).toHaveLength(3);
        expect(messages[0].type).toBe("event1");
        expect(messages[0].payload).toBe("data1");
        expect(messages[1].type).toBe("event2");
        expect(messages[1].payload).toBe("data2");
        expect(messages[2].type).toBe("event3");
        expect(messages[2].payload).toBe("data3");
    });

    test("on 提供选项对象但不提供 listener 时应该返回异步迭代器", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test", {
            filter: (msg) => msg.payload !== "blocked",
        });

        // 应该有异步迭代器
        expect(Symbol.asyncIterator in subscriber).toBe(true);

        // 验证 filter 选项生效
        emitter.emit("test", "blocked");
        emitter.emit("test", "allowed");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        // 应该只收到通过 filter 的消息
        expect(messages).toHaveLength(1);
        expect(messages[0].payload).toBe("allowed");
    });

    test("onAny 提供选项对象但不提供 listener 时应该返回异步迭代器", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.onAny({
            filter: (msg) => msg.type !== "blocked",
        });

        // 应该有异步迭代器
        expect(Symbol.asyncIterator in subscriber).toBe(true);

        // 验证 filter 选项生效
        emitter.emit("blocked", "data1");
        emitter.emit("allowed", "data2");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        // 应该只收到通过 filter 的消息
        expect(messages).toHaveLength(1);
        expect(messages[0].type).toBe("allowed");
        expect(messages[0].payload).toBe("data2");
    });
});

describe("Pipe 集成", () => {
    test("iterable=true 时应该默认添加 queue pipe", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 发送多条消息
        for (let i = 0; i < 10; i++) {
            emitter.emit("test", i);
        }

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 10) break;
        }

        expect(messages).toHaveLength(10);
    });

    test("用户应该可以覆盖默认的 queue pipe", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test", {
            pipes: [queue({ size: 2, overflow: "slide" })],
        });

        // 发送超过队列大小的消息
        for (let i = 0; i < 5; i++) {
            emitter.emit("test", i);
        }

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 2) break;
        }

        // 应该只收到最后 2 条消息（slide 策略）
        expect(messages).toHaveLength(2);
    });

    // test("应该支持多个 pipe 组合", async () => {
    //     const emitter = new FastEvent();
    //     const subscriber = emitter.on("test", {
    //         pipes: [
    //             throttle(50), // 节流
    //             queue({ size: 5 }),
    //         ],
    //     });

    //     // 快速发送多条消息
    //     for (let i = 0; i < 10; i++) {
    //         emitter.emit("test", i);
    //     }

    //     const messages = [];
    //     for await (const msg of subscriber) {
    //         messages.push(msg);
    //         if (messages.length === 2) break;
    //     }
    //     // 由于节流，应该收到的消息较少
    //     expect(messages.length).toBeLessThanOrEqual(5);
    // });
});

describe("并发安全", () => {
    test("应该在迭代完成后允许重新迭代", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        const messages = [];
        emitter.emit("test", "msg1");

        // 第一次迭代
        for await (const msg of subscriber) {
            expect(msg.payload).toBe("msg1");
            messages.push(msg);
            break;
        }
        // 需要重置才可以第二次迭代
        subscriber.on();

        // 第二次迭代应该可以开始
        emitter.emit("test", "msg2");
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        expect(messages[0].payload).toBe("msg1");
        expect(messages[1].payload).toBe("msg2");
    });
});

describe("边缘情况", () => {
    test("空队列时应该等待新消息", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        const iterator = subscriber[Symbol.asyncIterator]();

        // 延迟发送消息
        setTimeout(() => {
            emitter.emit("test", "delayed");
        }, 50);

        const { value } = await iterator.next();
        expect(value.payload).toBe("delayed");
    });

    test("关闭后迭代应该结束", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        emitter.emit("test", "msg1");
        subscriber.off();

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
        }
        expect(messages).toHaveLength(0);

        expect(emitter.getListeners("test").length).toBe(0);
    });
});

describe("FastEvent 异步迭代器取消订阅", () => {
    test("通过传入 signal 参数使用 AbortSignal 来取消订阅", async () => {
        const emitter = new FastEvent();
        const abortController = new AbortController();

        const subscriber = emitter.on("test", {
            iterable: {
                signal: abortController.signal,
            },
        });

        // 先消费一条消息，清空队列
        emitter.emit("test", "message1");
        const firstMsg = await subscriber[Symbol.asyncIterator]().next();
        expect(firstMsg.value.payload).toBe("message1");

        // 然后在等待新消息时中止
        const messages = [firstMsg.value];
        setTimeout(() => {
            abortController.abort();
        }, 10);

        try {
            for await (const msg of subscriber) {
                messages.push(msg);
            }
        } catch (error: unknown) {
            // 期望收到 AbortError
            expect(error).toBeInstanceOf(AbortError);
        }

        // 应该只收到一条消息
        expect(messages).toHaveLength(1);
    });

    test("在 for await 内部 throw 错误来自动取消订阅", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 发送一些消息
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");
        emitter.emit("test", "message3");

        const messages: any[] = [];
        const customError = new Error("Custom error in iteration");

        try {
            for await (const msg of subscriber) {
                messages.push(msg);
                // 在收到第二条消息后抛出错误
                if (messages.length === 2) {
                    throw customError;
                }
            }
        } catch (error: unknown) {
            // 期望收到自定义错误
            expect(error).toBe(customError);
        }

        // 应该只收到两条消息
        expect(messages).toHaveLength(2);
        expect(messages[0].payload).toBe("message1");
        expect(messages[1].payload).toBe("message2");

        // 验证订阅已被取消，后续消息不会被接收
        emitter.emit("test", "message4");
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(messages).toHaveLength(2); // 长度不变
    });

    test("在 for await 内部 return 来自动取消订阅", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");
        let subscribeCount = emitter.getListeners("test").length;
        // 发送一些消息
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");
        emitter.emit("test", "message3");

        const messages: any[] = [];
        let returnedValue: string | undefined;

        // 使用 IIFE 来支持 return 语句
        await (async () => {
            for await (const msg of subscriber) {
                messages.push(msg);
                // 在收到第二条消息后 return
                if (messages.length === 2) {
                    returnedValue = "early exit";
                    return;
                }
            }
        })();
        expect(emitter.getListeners("test").length).toBe(0);
        // 应该只收到两条消息
        expect(messages).toHaveLength(2);
        expect(messages[0].payload).toBe("message1");
        expect(messages[1].payload).toBe("message2");
        expect(returnedValue).toBe("early exit");

        // 验证订阅已被取消，后续消息不会被接收
        emitter.emit("test", "message4");
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(messages).toHaveLength(2); // 长度不变
    });

    test("在 for await 内部 break 来自动取消订阅", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 发送一些消息
        emitter.emit("test", "message1");
        emitter.emit("test", "message2");
        emitter.emit("test", "message3");

        const messages: any[] = [];

        for await (const msg of subscriber) {
            messages.push(msg);
            // 在收到第二条消息后 break
            if (messages.length === 2) {
                break;
            }
        }

        expect(emitter.getListeners("test").length).toBe(0);
        // 应该只收到两条消息
        expect(messages).toHaveLength(2);
        expect(messages[0].payload).toBe("message1");
        expect(messages[1].payload).toBe("message2");

        // 验证订阅已被取消，后续消息不会被接收
        emitter.emit("test", "message4");
        await new Promise((resolve) => setTimeout(resolve, 10));
        expect(messages).toHaveLength(2); // 长度不变
    });

    test("break 后应该能重新开始迭代（需要调用 on()）", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        // 发送消息
        emitter.emit("test", "message1");

        // 第一次迭代并 break
        const messages1: any[] = [];
        for await (const msg of subscriber) {
            messages1.push(msg);
            break;
        }

        expect(messages1).toHaveLength(1);
        expect(messages1[0].payload).toBe("message1");

        // 重新启用订阅
        subscriber.on();

        // 发送新消息
        emitter.emit("test", "message2");

        // 第二次迭代
        const messages2: any[] = [];
        for await (const msg of subscriber) {
            messages2.push(msg);
            break;
        }

        expect(messages2).toHaveLength(1);
        expect(messages2[0].payload).toBe("message2");
    });
});

describe("向后兼容性", () => {
    test("不启用 iterable 时原有功能完全不受影响", () => {
        const emitter = new FastEvent();
        const mockListener = vi.fn();

        emitter.on("test", mockListener);
        emitter.emit("test", "data");

        expect(mockListener).toHaveBeenCalledWith(
            expect.objectContaining({ payload: "data" }),
            expect.any(Object),
        );
    });

    test("应该保留所有现有选项的功能", () => {
        const emitter = new FastEvent();
        const mockListener = vi.fn();

        // count 选项
        const sub1 = emitter.on("test", mockListener, { count: 1 });
        emitter.emit("test", "msg1");
        emitter.emit("test", "msg2");
        expect(mockListener).toHaveBeenCalledTimes(1);

        // prepend 选项
        const order: string[] = [];
        emitter.on("test", () => order.push("first"));
        emitter.on("test", () => order.push("last"), { prepend: false });
        emitter.emit("test", "data");
        expect(order).toEqual(["first", "last"]);

        // filter 选项
        let filterCallCount = 0;
        const mockListener2 = vi.fn();
        emitter.on("test", mockListener2, {
            filter: (msg) => {
                filterCallCount++;
                return msg.payload === "allowed";
            },
        });
        emitter.emit("test", "blocked");
        emitter.emit("test", "allowed");
        expect(filterCallCount).toBe(2);
        expect(mockListener).toHaveBeenCalledTimes(1); // 只通过 filter 的被调用

        // off 选项
        let offCallCount = 0;
        emitter.on("test", mockListener, {
            off: (msg) => {
                offCallCount++;
                return msg.payload === "auto-remove";
            },
        });
        emitter.emit("test", "continue");
        emitter.emit("test", "auto-remove");
        expect(offCallCount).toBe(2);
    });

    test("应该保留 pipes 功能", async () => {
        const emitter = new FastEvent();
        const mockListener = vi.fn();

        // 使用 queue pipe
        emitter.on("test", mockListener, {
            pipes: [queue({ size: 2, overflow: "slide" })],
        });

        // 快速发送多条消息
        for (let i = 0; i < 5; i++) {
            emitter.emit("test", i);
        }

        // 等待异步处理
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 验证 queue pipe 正常工作
        expect(mockListener).toHaveBeenCalled();
    });

    test("应该保留 onAddListener 钩子", () => {
        const emitter = new FastEvent({
            onAddListener: (type, listener, options) => {
                // 可以返回 false 取消注册
                // 或返回自定义订阅者
                return true;
            },
        });

        const subscriber = emitter.on("test", () => {});
        expect(subscriber).toBeDefined();
    });

    test("应该保留其他选项的功能", async () => {
        const emitter = new FastEvent();
        let filterCallCount = 0;

        const subscriber = emitter.on("test", {
            filter: (msg) => {
                filterCallCount++;
                return msg.payload === "allowed";
            },
        });

        emitter.emit("test", "blocked");
        emitter.emit("test", "allowed");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 1) break;
        }

        // filter 应该正常工作
        expect(filterCallCount).toBe(2);
        expect(messages).toHaveLength(1);
        expect(messages[0].payload).toBe("allowed");
    });
});
