import type { FastEventListenerArgs, FastEventMessage } from "fastevent";

export type EventLog = {
    id: number;
    message: WeakRef<FastEventMessage>;
    triggerTime: number;
    duration: [number, number]; // 执行时间
    args: WeakRef<FastEventListenerArgs>; //
    listeners: {
        fn: any; // 监听器函数引用
        status: "running" | "ok" | "error";
        name: string; // 监听器函数名称
        tag: string | undefined;
        count: string; // 实际执行的次数/触发的次数限制
        falgs: any;
        result: any; // 监听器返回结果
    }[];
};
