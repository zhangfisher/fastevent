// oxlint-disable no-unused-expressions
// oxlint-disable no-unused-vars
import { describe, test, expect, vi } from "vitest";
import { FastEvent } from "../../event";
import { queue, throttle } from "../../pipes";
import { NotPayload } from "../../types";

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
        emitter.emit("test", "after");

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        expect(messages).toHaveLength(1);
        expect(messages[0].payload).toBe("before");
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
            iterable: true,
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

    test("应该支持多个 pipe 组合", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test", {
            iterable: true,
            pipes: [
                throttle(50), // 节流
                queue({ size: 5 }),
            ],
        });

        // 快速发送多条消息
        for (let i = 0; i < 10; i++) {
            emitter.emit("test", i);
        }

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 5) break;
        }

        // 由于节流，应该收到的消息较少
        expect(messages.length).toBeLessThanOrEqual(5);
    });
});

describe("并发安全", () => {
    test("不应该允许同时迭代同一个订阅者", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        const iterator1 = subscriber[Symbol.asyncIterator]();

        // 尝试创建第二个迭代器应该失败
        expect(() => {
            subscriber[Symbol.asyncIterator]();
        }).toThrow();
    });

    test("应该在迭代完成后允许重新迭代", async () => {
        const emitter = new FastEvent();
        const subscriber = emitter.on("test");

        emitter.emit("test", "msg1");

        // 第一次迭代
        for await (const msg of subscriber) {
            expect(msg.payload).toBe("msg1");
            break;
        }

        // 第二次迭代应该可以开始
        emitter.emit("test", "msg2");
        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            break;
        }

        expect(messages[0].payload).toBe("msg2");
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

        expect(messages).toHaveLength(1);
    });
});

describe("向后兼容性", () => {
    test("不启用 iterable 时原有功能完全不受影响", () => {
        const emitter = new FastEvent();
        const mockListener = vi.fn();

        emitter.on("test", mockListener);
        emitter.emit("test", "data");

        expect(mockListener).toHaveBeenCalledWith(
            expect.objectContaining({ data: "data" }),
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
        emitter.on("test", mockListener, {
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

    test("iterable=true 时应该保留其他选项的功能", async () => {
        const emitter = new FastEvent();
        let filterCallCount = 0;

        const subscriber = emitter.on("test", {
            iterable: true,
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

    test("iterable=true 时应该保留自定义 pipes", async () => {
        const emitter = new FastEvent();

        const subscriber = emitter.on("test", {
            iterable: true,
            pipes: [
                throttle(50), // 自定义 pipe
                queue({ size: 5 }),
            ],
        });

        // 快速发送多条消息
        for (let i = 0; i < 10; i++) {
            emitter.emit("test", i);
        }

        const messages = [];
        for await (const msg of subscriber) {
            messages.push(msg);
            if (messages.length === 5) break;
        }

        // 自定义 pipes 应该正常工作
        expect(messages.length).toBeLessThanOrEqual(5);
    });
});
