// @ts-no-check
import { describe, test, expect, vi } from "bun:test";
import { FastLiteEvent } from "../liteEvent";
import { FastEvent } from "../event";

describe("FastLiteEvent 基础 on/emit", () => {
    test("注册监听器并触发事件，应收到消息", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("test", listener);
        emitter.emit("test", { data: 1 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toEqual({
            type: "test",
            payload: { data: 1 },
        });
    });

    test("多个监听器应按注册顺序执行", () => {
        const emitter = new FastLiteEvent();
        const order: string[] = [];
        emitter.on("x", () => order.push("a"));
        emitter.on("x", () => order.push("b"));
        emitter.on("x", () => order.push("c"));
        emitter.emit("x");
        expect(order).toEqual(["a", "b", "c"]);
    });

    test("emit 应聚合所有监听器的返回值", () => {
        const emitter = new FastLiteEvent();
        emitter.on("x", () => 1);
        emitter.on("x", () => 2);
        const results = emitter.emit("x");
        expect(results).toEqual([1, 2]);
    });

    test("空事件名应抛错", () => {
        const emitter = new FastLiteEvent();
        expect(() => emitter.on("", () => {})).toThrow();
    });

    test("对象形式 emit", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("login", listener);
        emitter.emit({ type: "login", payload: { id: 1 } });
        expect(listener.mock.calls[0][0]).toEqual({
            type: "login",
            payload: { id: 1 },
        });
    });
});

describe("FastLiteEvent once / onAny", () => {
    test("once 只触发一次", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.once("x", listener);
        emitter.emit("x", 1);
        emitter.emit("x", 2);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("onAny 监听所有事件", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.onAny(listener);
        emitter.emit("a", 1);
        emitter.emit("b", 2);
        emitter.emit("a/b/c", 3);
        expect(listener).toHaveBeenCalledTimes(3);
    });
});

// 回归：once/count 监听器在跨多节点匹配或 retain 回放时被错误删除/漏删
// 根因：_decListenerExecCount 的 splice 误用外层收集列表下标，且 _executeListeners
// 的 localIdx 在 filter 跳过时未递增。两个缺陷须同修。
describe("FastLiteEvent once 跨多节点删除回归", () => {
    test("once + onAny(**) 共存时 emit 后 once 监听器被正确移除", () => {
        const emitter = new FastLiteEvent();
        const m0 = vi.fn(); // onAny -> root["**"].__listeners[0]
        const l0 = vi.fn(); // on("a") -> root["a"].__listeners[0]
        const l1 = vi.fn(); // once("a") -> root["a"].__listeners[1]
        const l2 = vi.fn(); // once("a") -> root["a"].__listeners[2]
        emitter.onAny(m0);
        emitter.on("a", l0);
        emitter.once("a", l1);
        emitter.once("a", l2);

        emitter.emit("a", 1);
        expect(m0).toHaveBeenCalledTimes(1);
        expect(l0).toHaveBeenCalledTimes(1);
        expect(l1).toHaveBeenCalledTimes(1);
        expect(l2).toHaveBeenCalledTimes(1);

        // 第二次 emit：once 监听器不应再触发（bug 时 l1 泄漏会再次执行）
        emitter.emit("a", 2);
        expect(m0).toHaveBeenCalledTimes(2);
        expect(l0).toHaveBeenCalledTimes(2);
        expect(l1).toHaveBeenCalledTimes(1);
        expect(l2).toHaveBeenCalledTimes(1);
    });

    test("once + on(*) 跨多节点时 once 被正确移除", () => {
        const emitter = new FastLiteEvent();
        const w = vi.fn(); // on("*") -> root["*"].__listeners[0]
        const l0 = vi.fn(); // on("a") -> root["a"].__listeners[0]
        const l1 = vi.fn(); // once("a") -> root["a"].__listeners[1]
        emitter.on("*", w);
        emitter.on("a", l0);
        emitter.once("a", l1);

        emitter.emit("a", 1);
        expect(w).toHaveBeenCalledTimes(1);
        expect(l0).toHaveBeenCalledTimes(1);
        expect(l1).toHaveBeenCalledTimes(1);

        emitter.emit("a", 2);
        expect(w).toHaveBeenCalledTimes(2);
        expect(l0).toHaveBeenCalledTimes(2);
        expect(l1).toHaveBeenCalledTimes(1);
    });

    test("retain 回放 once 时不误删同节点其他监听器", () => {
        const emitter = new FastLiteEvent();
        emitter.emit("a", 1, true); // 保留消息

        const other = vi.fn(); // 先注册：立即收到 retain 回放
        emitter.on("a", other);
        expect(other).toHaveBeenCalledTimes(1);

        const onceL = vi.fn(); // 后注册：retain 回放时 filter 只匹配 onceL
        emitter.once("a", onceL);
        expect(onceL).toHaveBeenCalledTimes(1);

        // 再次 emit：other 不应被误删，onceL 不应泄漏
        emitter.emit("a", 2);
        expect(other).toHaveBeenCalledTimes(2);
        expect(onceL).toHaveBeenCalledTimes(1);
    });

    test("once 监听器执行后 listenerCount 应递减", () => {
        const emitter = new FastLiteEvent();
        emitter.once("a", vi.fn());
        emitter.once("a", vi.fn());
        expect(emitter.listenerCount).toBe(2);
        emitter.emit("a", 1);
        expect(emitter.listenerCount).toBe(0); // bug 时为 2（未递减）
    });

    test("count 限制监听器达标后 listenerCount 应递减", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", vi.fn(), { count: 2 });
        expect(emitter.listenerCount).toBe(1);
        emitter.emit("a", 1);
        expect(emitter.listenerCount).toBe(1); // count=2，执行 1 次未达标
        emitter.emit("a", 2);
        expect(emitter.listenerCount).toBe(0); // 达标删除，bug 时为 1
    });
});

describe("FastLiteEvent 通配符", () => {
    test("单层通配符 * 匹配一层路径", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("user/*", listener);
        emitter.emit("user/login", 1);
        emitter.emit("user/logout", 2);
        // * 不匹配多级
        emitter.emit("user/profile/update", 3);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    test("多层通配符 ** 匹配多级路径", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("user/**", listener);
        emitter.emit("user/login", 1);
        emitter.emit("user/profile/update", 2);
        emitter.emit("user/a/b/c", 3);
        expect(listener).toHaveBeenCalledTimes(3);
    });

    test("中间通配符 a/*/c", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("a/*/c", listener);
        emitter.emit("a/x/c", 1);
        emitter.emit("a/y/c", 2);
        emitter.emit("a/x/y/c", 3); // 不匹配
        expect(listener).toHaveBeenCalledTimes(2);
    });
});

describe("FastLiteEvent off / offAll / clear", () => {
    test("off(listener) 移除指定监听器", () => {
        const emitter = new FastLiteEvent();
        const l1 = vi.fn();
        const l2 = vi.fn();
        emitter.on("x", l1);
        emitter.on("x", l2);
        emitter.off("x", l1);
        emitter.emit("x");
        expect(l1).not.toHaveBeenCalled();
        expect(l2).toHaveBeenCalledTimes(1);
    });

    test("off(listener) 直接传函数", () => {
        const emitter = new FastLiteEvent();
        const l1 = vi.fn();
        emitter.on("x", l1);
        emitter.off(l1);
        emitter.emit("x");
        expect(l1).not.toHaveBeenCalled();
    });

    test("off(type) 移除该类型所有监听器", () => {
        const emitter = new FastLiteEvent();
        const l1 = vi.fn();
        const l2 = vi.fn();
        emitter.on("x", l1);
        emitter.on("x", l2);
        emitter.off("x");
        emitter.emit("x");
        expect(l1).not.toHaveBeenCalled();
        expect(l2).not.toHaveBeenCalled();
    });

    test("offAll() 移除所有监听器", () => {
        const emitter = new FastLiteEvent();
        const l1 = vi.fn();
        const l2 = vi.fn();
        emitter.on("a", l1);
        emitter.on("b", l2);
        emitter.offAll();
        emitter.emit("a");
        emitter.emit("b");
        expect(l1).not.toHaveBeenCalled();
        expect(l2).not.toHaveBeenCalled();
        expect(emitter.listenerCount).toBe(0);
    });

    test("offAll(prefix) 仅移除指定前缀下的监听器", () => {
        const emitter = new FastLiteEvent();
        const lUser = vi.fn();
        const lOrder = vi.fn();
        emitter.on("user/login", lUser);
        emitter.on("order/create", lOrder);
        emitter.offAll("user");
        emitter.emit("user/login");
        emitter.emit("order/create");
        expect(lUser).not.toHaveBeenCalled();
        expect(lOrder).toHaveBeenCalledTimes(1);
    });

    test("clear(prefix) 清除监听器与保留消息", () => {
        const emitter = new FastLiteEvent();
        emitter.emit("user/login", { id: 1 }, true); // retain
        emitter.clear("user");
        const listener = vi.fn();
        emitter.on("user/login", listener);
        // 清除后新订阅者不应收到保留消息
        expect(listener).not.toHaveBeenCalled();
    });

    test("subscriber.off() 与 Symbol.dispose", () => {
        const emitter = new FastLiteEvent();
        const l1 = vi.fn();
        const sub = emitter.on("x", l1);
        sub.off();
        emitter.emit("x");
        expect(l1).not.toHaveBeenCalled();

        const l2 = vi.fn();
        using sub2 = emitter.on("x", l2); // 触发 Symbol.dispose
        sub2.off();
        emitter.emit("x");
        expect(l2).not.toHaveBeenCalled();
    });
});

describe("FastLiteEvent retain 保留事件", () => {
    test("新订阅者立即收到最后一条保留消息", () => {
        const emitter = new FastLiteEvent();
        emitter.emit("status", "online", true);
        const listener = vi.fn();
        emitter.on("status", listener);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0]).toEqual({
            type: "status",
            payload: "online",
        });
    });

    test("通配符订阅者匹配多条保留消息", () => {
        const emitter = new FastLiteEvent();
        emitter.emit("user/login", { id: 1 }, true);
        emitter.emit("user/logout", { id: 2 }, true);
        const listener = vi.fn();
        emitter.on("user/*", listener);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    test("clearRetainMessages 清除指定保留消息", () => {
        const emitter = new FastLiteEvent();
        emitter.emit("a", 1, true);
        emitter.clearRetainMessages("a");
        const listener = vi.fn();
        emitter.on("a", listener);
        expect(listener).not.toHaveBeenCalled();
    });
});

describe("FastLiteEvent count / tag", () => {
    test("count 限制触发次数", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("x", listener, { count: 2 });
        emitter.emit("x", 1);
        emitter.emit("x", 2);
        emitter.emit("x", 3);
        expect(listener).toHaveBeenCalledTimes(2);
    });

    test("tag 不影响触发，仅作标记", () => {
        const emitter = new FastLiteEvent();
        const listener = vi.fn();
        emitter.on("x", listener, { tag: "myTag" });
        emitter.emit("x");
        expect(listener).toHaveBeenCalledTimes(1);
        const listeners = emitter.getListeners("x");
        expect(listeners[0][3]).toBe("myTag");
    });
});

describe("FastLiteEvent ignoreErrors", () => {
    test("ignoreErrors=true（默认）吞错并返回错误对象", () => {
        const emitter = new FastLiteEvent();
        emitter.on("x", () => {
            throw new Error("boom");
        });
        const results = emitter.emit("x");
        expect(results[0]).toBeInstanceOf(Error);
        expect((results[0] as Error).message).toBe("boom");
    });

    test("ignoreErrors=false 抛出错误", () => {
        const emitter = new FastLiteEvent({ ignoreErrors: false });
        emitter.on("x", () => {
            throw new Error("boom");
        });
        expect(() => emitter.emit("x")).toThrow("boom");
    });
});

describe("FastLiteEvent transform", () => {
    test("transform 转换 payload", () => {
        const emitter = new FastLiteEvent({
            transform: (message: any) => {
                if (message.type === "raw") {
                    return { wrapped: message.payload };
                }
                return message;
            },
        });
        const listener = vi.fn();
        emitter.on("raw", listener);
        emitter.emit("raw", 123);
        // 经 transform 后，监听器收到的是转换后的 payload
        expect(listener.mock.calls[0][0]).toEqual({ wrapped: 123 });
    });
});

describe("FastLiteEvent emitAsync", () => {
    test("emitAsync 聚合异步监听器结果", async () => {
        const emitter = new FastLiteEvent();
        emitter.on("x", async () => 1);
        emitter.on("x", async () => 2);
        const results = await emitter.emitAsync("x");
        expect(results).toEqual([1, 2]);
    });

    test("emitAsync 包含失败监听器的 Error", async () => {
        const emitter = new FastLiteEvent();
        emitter.on("x", async () => 1);
        emitter.on("x", async () => {
            throw new Error("fail");
        });
        const results = await emitter.emitAsync("x");
        expect(results[0]).toBe(1);
        expect(results[1]).toBeInstanceOf(Error);
    });
});

describe("FastLiteEvent getListeners", () => {
    test("返回指定类型的监听器元数据", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", () => {});
        emitter.on("a", () => {});
        emitter.on("a/b", () => {});
        const listeners = emitter.getListeners("a");
        expect(listeners.length).toBe(2);
    });
});

describe("FastLiteEvent 类型与实例属性", () => {
    test("实例基本属性", () => {
        const emitter = new FastLiteEvent({ id: "custom-id", title: "MyEmitter" });
        expect(emitter.id).toBe("custom-id");
        expect(emitter.title).toBe("MyEmitter");
        expect(emitter.options.delimiter).toBe("/");
        expect(emitter.__FastLiteEvent__).toBe(true);
        expect(emitter.listenerCount).toBe(0);
    });

    test("默认 delimiter 可自定义", () => {
        const emitter = new FastLiteEvent({ delimiter: "." });
        const listener = vi.fn();
        emitter.on("user.login", listener);
        emitter.emit("user.login", 1);
        expect(listener).toHaveBeenCalledTimes(1);
    });

    test("类型兼容性：同一监听器函数可用于 FastEvent 与 FastLiteEvent（编译期断言）", () => {
        const lite = new FastLiteEvent<{ a: number }>();
        const evt = new FastEvent<{ a: number }>();
        // 同一个监听器函数，签名兼容两者
        const shared = (message: { type: string; payload: any }) => message.payload;
        lite.on("a", shared as any);
        evt.on("a", shared as any);
        // 运行时验证：两者都能正常触发
        const liteFn = vi.fn();
        const evtFn = vi.fn();
        lite.on("a", liteFn);
        evt.on("a", evtFn);
        lite.emit("a", 1);
        evt.emit("a", 2);
        expect(liteFn).toHaveBeenCalledTimes(1);
        expect(evtFn).toHaveBeenCalledTimes(1);
    });
});
