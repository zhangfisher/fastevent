import type { FastEventListenerArgs, FastEventMessage } from "fastevent";

import type { FastEventListenerFlags } from "fastevent";

export type EventLog = {
    id: number;
    done: boolean;
    message: WeakRef<FastEventMessage>;
    triggerTime: number;
    duration: [number, number]; // 执行时间
    args: WeakRef<FastEventListenerArgs>; //
    updateVersion: number; // 更新版本号，用于触发组件重新渲染
    listeners: {
        fn: WeakRef<any>; // 监听器函数引用
        status: "running" | "ok" | "error";
        name: string; // 监听器函数名称
        tag: string | undefined;
        count: string; // 实际执行的次数/触发的次数限制
        flags?: FastEventListenerFlags;
        result: any; // 监听器返回结果
    }[];
};
