import { Bench } from "tinybench";
import { FastEvent } from "../event";
import { FastLiteEvent } from "../liteEvent";
import { EventEmitter2 } from "eventemitter2";

/**
 * FastLiteEvent 性能基准
 *
 * 方法学（分层）：
 *   1. 纯 emit 吞吐——循环外预 on，循环内只 emit，回调直累计数器，不包 Promise
 *   2. 完整生命周期——on + emit + off 作为真实场景参照
 *
 * 对照：FastLiteEvent vs FastEvent（主类）vs EventEmitter2
 *   - FastEvent / FastLiteEvent 用 '/' 分隔；EventEmitter2 用 '.'
 *   - ** / broadcast / retain / allSettled 语义 EventEmitter2 不对等：
 *       ** 用 onAny 近似；broadcast / retain 仅内部对照（FastLiteEvent vs FastEvent）
 *
 * 场景对应静态热点：
 *   S1 纯 emit N=1/10/100  → 热点1（_executeListeners 三遍遍历是否随 N 恶化）
 *   S2 深路径              → type.split + _traverseToPath 树遍历
 *   S3 ** 通配             → _traverseToPath 递归 + 通配符分支
 *   S4 broadcast 子树      → 热点2（forEachDescendant 路径数组复制 + join）
 *   S5 emitAsync vs emit   → 热点8（全同步监听器下 allSettled 开销）
 *   S6 retain 投递 N=1/100 → 热点3（_emitRetainMessage 的 O(N) filter）
 *   S7 on+emit+off 生命周期→ 真实场景参照
 */

const bench = new Bench({ time: 1000 });

// 防死码消除的累加器（bench 结束输出，确保回调副作用不被优化掉）
let sink = 0;
const noop = () => { sink++; };

// 预注册 N 个监听器到同一事件 type，返回配置好的实例
function prepEmit(Ctor: any, ctorArgs: any, type: string, n: number): any {
    const em: any = ctorArgs ? new Ctor(ctorArgs) : new Ctor();
    for (let i = 0; i < n; i++) em.on(type, noop);
    return em;
}
const EE2_OPTS = { wildcard: true, delimiter: "." };

// ====== S1 纯 emit 吞吐：N 个监听器（验证热点1 三遍遍历随 N 的变化）======
const NS = [1, 10, 100];
const leEmit = NS.map((n) => ({ n, em: prepEmit(FastLiteEvent, undefined, "x", n) }));
const feEmit = NS.map((n) => ({ n, em: prepEmit(FastEvent, undefined, "x", n) }));
const eeEmit = NS.map((n) => ({ n, em: prepEmit(EventEmitter2, EE2_OPTS, "x", n) }));
for (const { n, em } of leEmit) bench.add(`S1-emit N=${n} [FastLiteEvent]`, () => { em.emit("x", 1); });
for (const { n, em } of feEmit) bench.add(`S1-emit N=${n} [FastEvent]`, () => { em.emit("x", 1); });
for (const { n, em } of eeEmit) bench.add(`S1-emit N=${n} [EventEmitter2]`, () => { em.emit("x", 1); });

// ====== S2 深路径（split + 树遍历）======
const feDeep = prepEmit(FastEvent, undefined, "a/b/c/d/e/f", 1);
const leDeep = prepEmit(FastLiteEvent, undefined, "a/b/c/d/e/f", 1);
const eeDeep = prepEmit(EventEmitter2, EE2_OPTS, "a.b.c.d.e.f", 1);
bench.add("S2-deepPath [FastLiteEvent]", () => { leDeep.emit("a/b/c/d/e/f", 1); });
bench.add("S2-deepPath [FastEvent]", () => { feDeep.emit("a/b/c/d/e/f", 1); });
bench.add("S2-deepPath [EventEmitter2]", () => { eeDeep.emit("a.b.c.d.e.f", 1); });

// ====== S3 ** 通配（_traverseToPath 递归；EventEmitter2 用 onAny 近似）======
const feStar = new FastEvent(); feStar.on("**", noop);
const leStar = new FastLiteEvent(); leStar.on("**", noop);
const eeAny = new EventEmitter2(EE2_OPTS); eeAny.onAny(noop);
bench.add("S3-** [FastLiteEvent]", () => { leStar.emit("a/b/c", 1); });
bench.add("S3-** [FastEvent]", () => { feStar.emit("a/b/c", 1); });
bench.add("S3-onAny~ [EventEmitter2]", () => { eeAny.emit("a.b.c", 1); });

// ====== S4 broadcast 子树 N=100（验证热点2 路径数组复制 + join）======
// 仅内部对照：EventEmitter2 无等价 broadcast 语义
function prepBroadcast(Ctor: any, n: number): any {
    const em: any = new Ctor();
    for (let i = 0; i < n; i++) em.on(`a/b/c${i}`, noop);
    return em;
}
const feBc = prepBroadcast(FastEvent, 100);
const leBc = prepBroadcast(FastLiteEvent, 100);
bench.add("S4-broadcast N=100 [FastLiteEvent]", () => { leBc.emit("a/b", 1, { broadcast: true }); });
bench.add("S4-broadcast N=100 [FastEvent]", () => { feBc.emit("a/b", 1, { broadcast: true }); });

// ====== S5 emitAsync vs emit（全同步监听器；验证热点8 allSettled 开销）======
const feAsync = prepEmit(FastEvent, undefined, "x", 1);
const leAsync = prepEmit(FastLiteEvent, undefined, "x", 1);
bench.add("S5-emit [FastLiteEvent]", () => { leAsync.emit("x", 1); });
bench.add("S5-emitAsync [FastLiteEvent]", async () => { await leAsync.emitAsync("x", 1); });
bench.add("S5-emit [FastEvent]", () => { feAsync.emit("x", 1); });
bench.add("S5-emitAsync [FastEvent]", async () => { await feAsync.emitAsync("x", 1); });

// ====== S6 retain 投递（验证热点3 _emitRetainMessage 的 O(N) filter）======
// 预注册 N 个监听器 → emit retain → bench 测 on（触发 retain 投递）+ off
// N 越大，retain 投递时 filter 遍历越慢 → 验证热点3 是否随 N 线性恶化
function prepRetain(Ctor: any, n: number): any {
    const em: any = new Ctor();
    for (let i = 0; i < n; i++) em.on("x", noop);
    em.emit("x", 1, { retain: true });
    return em;
}
const feRet1 = prepRetain(FastEvent, 1);
const leRet1 = prepRetain(FastLiteEvent, 1);
const feRet100 = prepRetain(FastEvent, 100);
const leRet100 = prepRetain(FastLiteEvent, 100);
bench.add("S6-retain on N=1 [FastLiteEvent]", () => { const s = leRet1.on("x", noop); s.off(); });
bench.add("S6-retain on N=100 [FastLiteEvent]", () => { const s = leRet100.on("x", noop); s.off(); });
bench.add("S6-retain on N=1 [FastEvent]", () => { const s = feRet1.on("x", noop); s.off(); });
bench.add("S6-retain on N=100 [FastEvent]", () => { const s = feRet100.on("x", noop); s.off(); });

// ====== S7 on+emit+off 完整生命周期（真实场景参照）======
const feLife = new FastEvent();
const leLife = new FastLiteEvent();
const eeLife = new EventEmitter2(EE2_OPTS);
bench.add("S7-on+emit+off [FastLiteEvent]", () => {
    const s = leLife.on("x", noop); leLife.emit("x", 1); s.off();
});
bench.add("S7-on+emit+off [FastEvent]", () => {
    const s = feLife.on("x", noop); feLife.emit("x", 1); s.off();
});
bench.add("S7-on+emit+off [EventEmitter2]", () => {
    const l = eeLife.on("x", noop, { objectify: true }); eeLife.emit("x", 1); (l as any).off();
});

(async () => {
    await bench.run();
    console.table(bench.table());
    console.log("sink =", sink);
})();
