import { FastEvent } from "fastevent";

/**
 * 创建 FastEvent 实例
 */
const emitter = new FastEvent({
    debug: true,
});

// 挂载到全局，方便调试
globalThis.emitter = emitter;

// ==================== 初始化所有监听器 ====================

// 简单事件监听器 - 返回字符串
function simpleEventHandler(data: any) {
    console.log("[简单事件] 收到数据:", data);
    return "✓ 简单事件处理完成";
}
emitter.on("test/simple", simpleEventHandler);

export function addSimpleSubscribe() {
    emitter.on("test/simple", () => {
        return Math.abs(Math.random() * 100);
    });
}
// 带标签的用户登录监听器 - 返回对象
function userLoginHandler(data: any) {
    console.log("[用户登录]", data);
    return {
        success: true,
        token: "mock-token-123",
        expiresAt: new Date(Date.now() + 3600000),
        userId: data.userId,
    };
}
emitter.on("user/login", userLoginHandler, { tag: "auth" });

function onAny(_message: any) {
    return Math.abs(Math.random() * 100);
}
// emitter.onAny(onAny);

// Transform 事件监听器 - 返回数组
function dataUpdateHandler(data: any) {
    console.log("[数据更新]", data);
    return [
        { id: 1, status: "updated" },
        { id: 2, status: "updated" },
        { id: 3, status: "updated" },
        { id: 4, status: "updated" },
        { id: 5, status: "updated" },
    ];
}
emitter.on("data/update", dataUpdateHandler, { tag: "data" });

// 错误事件监听器 - 抛出错误
function errorHandler() {
    console.log("[错误事件] 即将抛出错误");
    throw new Error("这是一个测试错误");
}
emitter.on("test/error", errorHandler);

// 多监听器事件 - 返回不同类型
function multiListener1() {
    console.log("→ 监听器 1 执行");
    return 42; // 返回数字
}
emitter.on("test/multi", multiListener1, { tag: "first" });

function multiListener2() {
    console.log("→ 监听器 2 执行");
    return ["结果1", "结果2", "结果3"]; // 返回数组
}
emitter.on("test/multi", multiListener2, { tag: "second" });

function multiListener3() {
    console.log("→ 监听器 3 执行");
    return {
        status: "completed",
        timestamp: Date.now(),
        metadata: { source: "listener-3" },
    }; // 返回对象
}
emitter.on("test/multi", multiListener3, { tag: "third" });

// 计数限制事件监听器（只执行3次）- 返回布尔值
let countedExecutions = 0;
function countedListener() {
    countedExecutions++;
    console.log(`[计数事件] 第 ${countedExecutions} 次执行`);
    return countedExecutions <= 3; // 返回布尔值
}
emitter.on("test/counted", countedListener, { count: 3 });

// 批量事件监听器 - 返回不同类型
function batchStartHandler(data: any) {
    console.log("[批量] 开始:", data);
    return { taskId: `task-${Date.now()}`, status: "started" };
}
emitter.on("batch/start", batchStartHandler);

function batchProcessingHandler(data: any) {
    console.log("[批量] 处理中:", data);
    return 50.5; // 返回浮点数
}
emitter.on("batch/processing", batchProcessingHandler);

function batchProgressHandler(data: any) {
    console.log("[批量] 进度:", data);
    return `${data.progress.toFixed(1)}% 完成`; // 返回模板字符串
}
emitter.on("batch/progress", batchProgressHandler);

function batchCompleteHandler(data: any) {
    console.log("[批量] 完成:", data);
    return null; // 返回 null
}
emitter.on("batch/complete", batchCompleteHandler);

// 通配符事件监听器 - 返回 Map
function userWildcardHandler(data: any, message: any) {
    console.log("[通配符] 用户事件:", message.type, data);
    const result = new Map([
        ["eventType", message.type],
        ["action", data.action],
        ["timestamp", Date.now()],
        ["processed", true],
    ]);
    return result; // 返回 Map
}
emitter.on("user/*", userWildcardHandler);

// 异步事件监听器 - 返回 Promise 对象
async function asyncEventHandler(data: any) {
    console.log("[异步事件] 开始处理:", data);
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("[异步事件] 处理完成");
    return {
        asyncResult: true,
        value: data.value,
        processedAt: new Date().toISOString(),
        duration: "100ms",
    }; // 返回对象
}
emitter.on("test/async", asyncEventHandler);

// 新增：长时间执行的监听器
async function longRunningHandler() {
    console.log("[长时间执行] 开始执行，预计耗时5秒");
    // 模拟耗时操作
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("[长时间执行] 执行完成");
    return {
        message: "长时间任务已完成",
        duration: "2秒",
        result: "成功",
    };
}
emitter.on("test/long-running", longRunningHandler, { tag: "slow" });

// 新增：随机数事件监听器
function randomNumberHandler(data: any) {
    console.log("[随机数事件] 收到:", data);
    return Math.random(); // 返回 0-1 之间的随机数
}
emitter.on("random/number", randomNumberHandler, { tag: "random" });

// ==================== 触发函数 ====================

/**
 * 触发简单事件
 */
export function triggerSimpleEvent() {
    emitter.emit("test/simple", {
        message: "这是一个简单事件",
        timestamp: Date.now(),
    });
}

/**
 * 触发带标签的事件
 */
export function triggerTaggedEvent() {
    emitter.emit(
        "user/login",
        { userId: 12345, username: "testuser" },
        true, // retain
    );
}

/**
 * 触发带 transform 的事件
 */
export function triggerTransformEvent() {
    emitter.emit("data/update", {
        items: [1, 2, 3, 4, 5],
        operation: "add",
    });
}

/**
 * 触发错误事件
 */
export function triggerErrorEvent() {
    emitter.emit("test/error", { shouldFail: true });
}

/**
 * 触发多监听器事件
 */
export function triggerMultiListenerEvent() {
    emitter.emit("test/multi", { listeners: 3 });
}

/**
 * 触发带计数限制的事件
 */
export function triggerCountedEvent() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            emitter.emit("test/counted", { iteration: i + 1 });
        }, i * 100);
    }
}

/**
 * 触发批量事件
 */
export function triggerBatchEvents() {
    const events = ["batch/start", "batch/processing", "batch/progress", "batch/complete"];

    events.forEach((type, index) => {
        setTimeout(() => {
            emitter.emit(type, {
                step: index + 1,
                total: events.length,
                progress: ((index + 1) / events.length) * 100,
            });
        }, index * 200);
    });
}

/**
 * 触发通配符测试事件
 */
export function triggerWildcardEvents() {
    emitter.emit("user/profile", { action: "view" });
    setTimeout(() => {
        emitter.emit("user/settings", { action: "update" });
    }, 100);
    setTimeout(() => {
        emitter.emit("user/avatar", { action: "change" });
    }, 200);
}

/**
 * 触发异步事件
 */
export async function triggerAsyncEvent() {
    await emitter.emitAsync("test/async", { value: "测试数据" });
}

/**
 * 触发长时间执行事件
 */
export async function triggerLongRunningEvent() {
    await emitter.emitAsync("test/long-running", { task: "长时间任务" });
}

// ==================== 定时触发随机事件 ====================

let randomEventInterval: number | null = null;

/**
 * 启动定时触发随机事件
 */
export function startRandomEvents() {
    if (randomEventInterval !== null) {
        console.log("随机事件已已经在运行");
        return;
    }

    console.log("🎲 开始定时触发随机事件...");

    randomEventInterval = window.setInterval(() => {
        // 随机选择一个事件类型
        const eventTypes = ["random/number", "test/simple", "data/update", "user/login"];
        const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

        // 生成随机数据
        const randomValue = Math.random();
        const randomInt = Math.floor(Math.random() * 1000);

        // 触发事件
        emitter.emit(randomType, {
            value: randomValue,
            int: randomInt,
            timestamp: Date.now(),
        });
    }, 2000); // 每2秒触发一次
}

/**
 * 停止定时触发随机事件
 */
export function stopRandomEvents() {
    if (randomEventInterval !== null) {
        clearInterval(randomEventInterval);
        randomEventInterval = null;
        console.log("⏹️ 已停止定时触发随机事件");
    } else {
        console.log("随机事件未在运行");
    }
}

// 自动启动随机事件
// startRandomEvents();

/**
 * 导出 emitter 供组件使用
 */
export { emitter };

declare global {
    var emitter: FastEvent;
}
