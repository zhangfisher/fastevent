// @ts-nocheck
/**
 * FastLiteEvent broadcast(发布端前缀广播)单元测试
 *
 * 覆盖:
 *   - emit 的 broadcast 选项(true 默认改写 / 函数改写 / null 跳过)
 *   - broadcast() 快捷方法
 *
 * 设计共识见 CONTEXT.md。
 */
import { describe, test, expect, vi } from "bun:test";
import { FastLiteEvent } from "../liteEvent";

describe.skip("FastLiteEvent emit broadcast 选项", () => {
    test("未开启 broadcast 时仅正常匹配触发(向后兼容)", () => {
        const emitter = new FastLiteEvent();
        const a = vi.fn();
        const ab = vi.fn();
        emitter.on("a", a);
        emitter.on("a/b", ab);
        emitter.emit("a", 1);
        expect(a).toHaveBeenCalledTimes(1);
        expect(ab).not.toHaveBeenCalled();
    });

    test("broadcast:true 时后代监听器收到改写为自身路径的 type", () => {
        const emitter = new FastLiteEvent();
        const a = vi.fn();
        const ab = vi.fn();
        const abc = vi.fn();
        emitter.on("a", a);
        emitter.on("a/b", ab);
        emitter.on("a/b/c", abc);
        emitter.emit("a", 1, { broadcast: true });

        expect(a).toHaveBeenCalledTimes(1);
        expect(a.mock.calls[0][0]).toEqual({ type: "a", payload: 1 });
        expect(ab).toHaveBeenCalledTimes(1);
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: 1 });
        expect(abc).toHaveBeenCalledTimes(1);
        expect(abc.mock.calls[0][0]).toEqual({ type: "a/b/c", payload: 1 });
    });

    test("broadcast:true 时 payload 原样透传给后代", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        emitter.on("a/b", ab);
        emitter.emit("a", { x: 1 }, { broadcast: true });
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: { x: 1 } });
    });

    test("broadcast 函数返回 null 跳过该后代", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        const ac = vi.fn();
        emitter.on("a/b", ab);
        emitter.on("a/c", ac);
        emitter.emit("a", 1, {
            broadcast: (type, message, args) => {
                if (type === "a/c") return null;
                return [{ ...message, type }, args];
            },
        });
        expect(ab).toHaveBeenCalledTimes(1);
        expect(ac).not.toHaveBeenCalled();
    });

    test("broadcast 函数可改写 payload 与 args", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        emitter.on("a/b", ab);
        emitter.emit("a", 1, {
            broadcast: (type, message, args) => {
                return [{ type, payload: 999 }, { ...args, rawEventType: "from-broadcast" }];
            },
        });
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: 999 });
        expect(ab.mock.calls[0][1].rawEventType).toBe("from-broadcast");
    });

    test("broadcast 函数仅返回 message 时 args 沿用原值", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        emitter.on("a/b", ab);
        emitter.emit("a", 1, {
            broadcast: (type, _message) => {
                return { type, payload: 999 };
            },
        });
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: 999 });
        expect(ab.mock.calls[0][1]).toBeDefined();
    });

    test("通配符订阅节点按字面路径触发(emit('a') 正常不触发 a/* 与 a/**)", () => {
        const emitter = new FastLiteEvent();
        const aStar = vi.fn();
        const aDouble = vi.fn();
        emitter.on("a/*", aStar);
        emitter.on("a/**", aDouble);

        // 先验证:无 broadcast 时 emit('a') 不触发 a/* / a/**
        emitter.emit("a", 1);
        expect(aStar).not.toHaveBeenCalled();
        expect(aDouble).not.toHaveBeenCalled();

        // 开启 broadcast:通配符节点被广播唤醒,type 为字面路径
        emitter.emit("a", 1, { broadcast: true });
        expect(aStar).toHaveBeenCalledTimes(1);
        expect(aStar.mock.calls[0][0].type).toBe("a/*");
        expect(aDouble).toHaveBeenCalledTimes(1);
        expect(aDouble.mock.calls[0][0].type).toBe("a/**");
    });

    test("正常匹配先于后代,后代按 DFS 先序触发", () => {
        const emitter = new FastLiteEvent();
        const order: string[] = [];
        emitter.on("a", () => order.push("a"));
        emitter.on("a/b", () => order.push("a/b"));
        emitter.on("a/b/c", () => order.push("a/b/c"));
        emitter.on("a/d", () => order.push("a/d"));
        emitter.emit("a", 1, { broadcast: true });
        expect(order).toEqual(["a", "a/b", "a/b/c", "a/d"]);
    });

    test("终点节点自身不因 broadcast 重复触发", () => {
        const emitter = new FastLiteEvent();
        const a = vi.fn();
        emitter.on("a", a);
        emitter.emit("a", 1, { broadcast: true });
        expect(a).toHaveBeenCalledTimes(1);
    });

    test("返回值按触发顺序合并正常与后代结果", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", () => "a");
        emitter.on("a/b", () => "a/b");
        emitter.on("a/c", () => "a/c");
        const results = emitter.emit("a", 1, { broadcast: true });
        expect(results).toEqual(["a", "a/b", "a/c"]);
    });

    test("retain 只保留原始 type,broadcast 副本不写入 retain 表", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", vi.fn());
        emitter.on("a/b", vi.fn());
        emitter.emit("a", 1, { broadcast: true, retain: true });
        expect(emitter.retainedMessages.has("a")).toBe(true);
        expect(emitter.retainedMessages.has("a/b")).toBe(false);
    });

    test("第三参 options 对象:retain 生效(向后兼容对象形式)", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", vi.fn());
        emitter.emit("a", 1, { retain: true });
        expect(emitter.retainedMessages.has("a")).toBe(true);
    });

    test("broadcast 触发的后代 once 监听器正常消耗计数", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        emitter.once("a/b", ab);
        emitter.emit("a", 1, { broadcast: true });
        emitter.emit("a", 1, { broadcast: true });
        expect(ab).toHaveBeenCalledTimes(1);
    });

    test("emitAsync 自动支持 broadcast", async () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn(async () => "ab-result");
        emitter.on("a/b", ab);
        await emitter.emitAsync("a", 1, { broadcast: true });
        expect(ab).toHaveBeenCalledTimes(1);
        expect(ab.mock.calls[0][0].type).toBe("a/b");
    });

    test("transform 逐最终 message 执行(先 broadcast 后 transform),能感知后代 type", () => {
        const emitter = new FastLiteEvent({
            transform: (message) => message.type, // 返回最终 type 作为 payload
        });
        const a = vi.fn();
        const ab = vi.fn();
        emitter.on("a", a);
        emitter.on("a/b", ab);
        emitter.emit("a", 1, { broadcast: true });
        // 监听器因 Transformed flag 收 payload(= transform 返回值 = 各自 type)
        expect(a.mock.calls[0][0]).toBe("a");
        expect(ab.mock.calls[0][0]).toBe("a/b");
    });

    test("onAny 只被正常匹配触发,broadcast 不重复", () => {
        const emitter = new FastLiteEvent();
        const any = vi.fn();
        emitter.onAny(any);
        emitter.on("a/b", vi.fn());
        emitter.emit("a", 1, { broadcast: true });
        expect(any).toHaveBeenCalledTimes(1);
        expect(any.mock.calls[0][0].type).toBe("a");
    });

    test("emit('a') 广播到多层后代子树", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        const abc = vi.fn();
        const abcd = vi.fn();
        emitter.on("a/b", ab);
        emitter.on("a/b/c", abc);
        emitter.on("a/b/c/d", abcd);
        emitter.emit("a", 1, { broadcast: true });
        expect(ab).toHaveBeenCalledTimes(1);
        expect(abc).toHaveBeenCalledTimes(1);
        expect(abcd).toHaveBeenCalledTimes(1);
    });
});

describe.skip("FastLiteEvent broadcast() 快捷方法", () => {
    test("省略 callback 时等价于 broadcast:true(默认改写 type)", () => {
        const emitter = new FastLiteEvent();
        const a = vi.fn();
        const ab = vi.fn();
        emitter.on("a", a);
        emitter.on("a/b", ab);
        emitter.broadcast("a", 1);
        expect(a.mock.calls[0][0]).toEqual({ type: "a", payload: 1 });
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: 1 });
    });

    test("传入 callback 作为自定义改写", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        emitter.on("a/b", ab);
        emitter.broadcast("a", 1, (type, _message) => {
            return { type, payload: 999 };
        });
        expect(ab.mock.calls[0][0]).toEqual({ type: "a/b", payload: 999 });
    });

    test("callback 返回 null 跳过后代", () => {
        const emitter = new FastLiteEvent();
        const ab = vi.fn();
        const ac = vi.fn();
        emitter.on("a/b", ab);
        emitter.on("a/c", ac);
        emitter.broadcast("a", 1, (type) => (type === "a/c" ? null : { type, payload: 1 }));
        expect(ab).toHaveBeenCalledTimes(1);
        expect(ac).not.toHaveBeenCalled();
    });

    test("retain 参数生效,且只保留原始 type", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", vi.fn());
        emitter.on("a/b", vi.fn());
        emitter.broadcast("a", 1, undefined, true);
        expect(emitter.retainedMessages.has("a")).toBe(true);
        expect(emitter.retainedMessages.has("a/b")).toBe(false);
    });

    test("返回值合并正常与后代结果", () => {
        const emitter = new FastLiteEvent();
        emitter.on("a", () => "a");
        emitter.on("a/b", () => "a/b");
        const results = emitter.broadcast("a", 1);
        expect(results).toEqual(["a", "a/b"]);
    });
});
