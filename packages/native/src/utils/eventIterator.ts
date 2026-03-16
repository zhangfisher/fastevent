/**
 * FastEventIterator - 使用异步迭代器从 FastEvent 或 FastEventScope 订阅事件
 * 重构：使用 queue.ts 中的队列参数和逻辑
 */

import { AbortError } from "../consts";
import type { FastEvent } from "../event";
import type { FastEventScope } from "../scope";
import type { FastEventMessage } from "../types/FastEventMessages";
import type { FastEventListener } from "../types/FastEventListeners";
import type { FastEventListenerArgs, FastEventListenOptions } from "../types/FastEvents";

// 溢出策略类型
export type FastQueueOverflows =
    | "drop" // 当缓冲区满时，丢弃新消息
    | "expand" // 当缓冲区满时，扩展缓冲区，每次扩展size，直到缓冲区大小达到maxSize
    | "slide" // 当缓冲区满时，将缓冲区中的消息向前移动，丢弃旧的消息
    | "throw"; // 当缓冲区满时，抛出异常

// FastEventIterator 配置选项
export interface FastEventIteratorOptions<T = FastEventMessage> {
    /** 缓冲区默认大小（默认：100） */
    size?: number;
    /** 缓冲区扩展到多大时不再扩展（默认：1000） */
    maxExpandSize?: number;
    /** 当扩展到最大大小后的溢出策略（默认：'slide'） */
    expandOverflow?: Omit<FastQueueOverflows, "expand">;
    /** 溢出策略（默认：'slide'） */
    overflow?: FastQueueOverflows;
    /** 消息生命周期（毫秒），0表示不启用（默认：0） */
    lifetime?: number;
    /** 当新消息到达时触发此回调 */
    onPush?: (newMessage: T, messages: [T, number][]) => void;
    /** 当消息被弹出时触发此回调，可以在此对消息队列进行排序等操作 */
    onPop?: (messages: [T, number][], hasNew: boolean) => [T, number] | undefined;
    /** 当消息被丢弃时触发此回调 */
    onDrop?: (message: T) => void;
    /** 错误处理函数，返回true表示继续迭代，false表示停止迭代 */
    onError?: (error: Error) => boolean | Promise<boolean>;
    /** 信号，用于取消迭代 */
    signal?: AbortSignal;
}

export class FastEventIterator<T = any> implements AsyncIterableIterator<T> {
    // 使用 [message, timestamp] 元组存储，支持 lifetime 机制
    private buffer: [T, number][] = [];
    private resolvers: Array<(value: IteratorResult<any>) => void> = [];
    private errorResolvers: Array<(error: Error) => void> = [];
    private isStopped = false; // 已经停止迭代
    private error: Error | null = null;
    private options: Required<
        Omit<FastEventIteratorOptions<T>, "onPush" | "onPop" | "onDrop" | "onError" | "signal">
    > & {
        onPush?: FastEventIteratorOptions<T>["onPush"];
        onPop?: FastEventIteratorOptions<T>["onPop"];
        onDrop?: FastEventIteratorOptions<T>["onDrop"];
        onError?: FastEventIteratorOptions<T>["onError"];
        signal?: AbortSignal;
    };
    private currentSize: number; // 当前缓冲区大小
    private hasNewMessage: boolean = false; // 自上次pop后是否有新消息
    private _listener: FastEventListener;
    private _ready: boolean = false;
    private _listenOptions?: FastEventListenOptions;
    private _cleanups: (() => void)[] = [];
    constructor(
        private eventEmitter: FastEvent<any> | FastEventScope<any, any, any>,
        private eventName: string,
        options: FastEventIteratorOptions<T> = {},
    ) {
        const defaultSize = 100;
        const defaultMaxExpandSize = 1000;

        this.options = {
            size: options.size ?? defaultSize,
            maxExpandSize: options.maxExpandSize ?? defaultMaxExpandSize,
            expandOverflow: options.expandOverflow ?? "slide",
            overflow: options.overflow ?? "slide",
            lifetime: options.lifetime ?? 0,
            onPush: options.onPush,
            onPop: options.onPop,
            onDrop: options.onDrop,
            onError: options.onError ?? (() => true),
            signal: options.signal,
        };

        // 确保 currentSize 被正确初始化
        this.currentSize = this.options.size;
        this._listener = this.onMessage.bind(this);
    }
    get listener() {
        return this._listener;
    }
    get ready() {
        return this._ready;
    }
    /**
     * 创建异步迭代器
     */
    create(options?: FastEventListenOptions) {
        if (this._ready) return;
        this._listenOptions = options;
        try {
            // 监听事件 - 使用 FastEvent 的 on 方法，返回订阅者对象
            const subscriber = (this.eventEmitter as any).on(
                this.eventName,
                this._listener,
                options,
            );
            this._cleanups.push(() => subscriber.off());
            // 处理中止信号
            if (this.options.signal) {
                const offFn = () => {
                    this.off(true);
                };
                this.options.signal.addEventListener("abort", offFn);
                this._cleanups.push(() => {
                    this.options.signal!.removeEventListener("abort", offFn);
                });
            }
        } finally {
            this._ready = true;
        }
    }
    /**
     * 推送消息到缓冲区
     */
    private push(message: T): void {
        if (this.options.onPush) {
            this.options.onPush(message, this.buffer);
        } else {
            this.buffer.push(this.options.lifetime > 0 ? [message, Date.now()] : [message, 0]);
        }
    }

    /**
     * 处理缓冲区溢出
     * @returns 返回 true 表示消息已添加，false 表示消息被丢弃
     */
    private handleOverflow(message: T): boolean {
        // 如果已达到最大大小且当前策略为expand，使用expandOverflow策略
        const strategy =
            this.buffer.length >= this.options.maxExpandSize && this.options.overflow === "expand"
                ? this.options.expandOverflow
                : this.options.overflow;

        switch (strategy) {
            case "drop":
                if (this.options.onDrop) this.options.onDrop(message);
                return false;
            case "expand":
                this.currentSize = Math.min(
                    this.currentSize + this.options.size,
                    this.options.maxExpandSize,
                );
                this.push(message);
                return true;
            case "slide":
                const msg = this.buffer.shift(); // 移除最旧的消息
                if (this.options.onDrop && msg) this.options.onDrop(msg[0]);
                this.push(message);
                return true;
            case "throw":
                if (this.options.onDrop) this.options.onDrop(message);
                throw new Error(
                    `EventIterator queue overflow: buffer size (${this.currentSize}) exceeded`,
                );
            default:
                return false;
        }
    }

    private onMessage(
        message: FastEventMessage<any, any, any>,
        _args: FastEventListenerArgs,
    ): void {
        if (this.isStopped) return;

        // 从 FastEvent 消息中提取 payload
        const data = message as T;

        // 如果有等待的消费者，直接resolve
        if (this.resolvers.length > 0) {
            const resolver = this.resolvers.shift()!;
            resolver({ value: data, done: false });
            return;
        }

        // 否则加入缓冲区
        this.hasNewMessage = true;

        if (this.buffer.length < this.currentSize) {
            this.push(data);
        } else {
            this.handleOverflow(data);
        }
    }
    /**
     * 中止监听
     * @param abort
     * @returns
     */
    off(abort?: boolean): void {
        if (!this._ready) return;
        if (this.isStopped) return;
        this.isStopped = true;
        // 取消事件订阅
        this._cleanups.forEach((fn) => fn());
        this._cleanups = [];
        this.buffer = [];
        this._ready = false;
        // 如果是强制中止，如调用了AbortSign
        if (abort) {
            // 清理等待的error resolvers
            this.errorResolvers.forEach((resolver) => {
                resolver(new AbortError());
            });
            this.errorResolvers = [];
        } else {
            // 清理等待的resolvers
            this.resolvers.forEach((resolver) => {
                resolver({ value: undefined, done: true });
            });
            this.resolvers = [];
        }
        this._ready = false;
    }

    async next(): Promise<IteratorResult<T>> {
        if (this.error) {
            return Promise.reject(this.error);
        }

        if (this.isStopped && this.buffer.length === 0) {
            return { value: undefined, done: true };
        }

        // 如果缓冲区有数据，立即返回
        if (this.buffer.length > 0) {
            let nextMessage: T | undefined;
            let enterTime: number;

            // 从队列中弹出消息
            if (this.options.onPop) {
                const result = this.options.onPop(this.buffer, this.hasNewMessage);
                if (result) {
                    [nextMessage, enterTime] = result;
                } else {
                    [nextMessage, enterTime] = this.buffer.shift() || [undefined, 0];
                }
            } else {
                [nextMessage, enterTime] = this.buffer.shift() || [undefined, 0];
            }

            // 重置 hasNewMessage 标志
            this.hasNewMessage = false;

            if (nextMessage !== undefined) {
                // 如果消息在缓冲区中停留的时间超过lifetime，丢弃该消息
                if (this.options.lifetime > 0 && Date.now() - enterTime > this.options.lifetime) {
                    if (this.options.onDrop) this.options.onDrop(nextMessage);
                    // 递归获取下一个消息
                    return this.next();
                }
                return { value: nextMessage, done: false };
            }
        }

        // 否则等待新事件
        return new Promise((resolve, reject) => {
            this.resolvers.push(resolve);
            this.errorResolvers.push(reject);
        });
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this as unknown as AsyncIterableIterator<T>;
    }

    async done(): Promise<IteratorResult<T>> {
        this.off();
        return { value: undefined, done: true };
    }

    async throw(error?: any): Promise<IteratorResult<T>> {
        this.error = error;
        this.off();
        return Promise.reject(error);
    }

    /**
     * 当 for await...of 循环被 break、return 或 throw 中断时调用
     * 自动清理资源，防止内存泄漏
     */
    async return(): Promise<IteratorResult<T>> {
        this.off();
        return { value: undefined, done: true };
    }

    /**
     * 同步资源释放（支持 using 语句）
     *
     * @description
     * 当使用 `using` 语句时，此方法会在作用域结束时自动调用，
     * 执行 off() 方法取消订阅。
     *
     * @example
     * ```ts
     * {
     *     using subscriber = emitter.on('event');
     *     // subscriber 在作用域结束时自动调用 off()
     * }
     * ```
     */
    [Symbol.dispose](): void {
        this.off();
    }

    on() {
        this.create(this._listenOptions);
        this.isStopped = false;
    }
}

/**
 * 创建一个异步迭代器，从 FastEvent 或 FastEventScope 订阅事件
 * @param eventEmitter FastEvent 或 FastEventScope 实例
 * @param eventName 事件名称
 * @param options 配置选项
 * @param listenerOptions 监听器配置选项
 * @returns 异步迭代器
 */
export function createAsyncEventIterator<T = any>(
    eventEmitter: FastEvent<any> | FastEventScope<any, any, any>,
    eventName: string,
    options: FastEventIteratorOptions<T> = {},
): FastEventIterator<T> {
    return new FastEventIterator<T>(eventEmitter, eventName, options);
}
