import { TypedFastEventMessage } from "./types/FastEventMessages";
import { TypedFastEventListener } from "./types/FastEventListeners";

/**
 * FastEvent 订阅者类，支持异步迭代
 *
 * @description
 * 当使用 { iterable: true } 选项时，返回此类的实例。
 * 支持使用 for await...of 语法异步迭代事件消息。
 *
 * @example
 * ```ts
 * const subscriber = emitter.on('event', null, { iterable: true });
 * for await (const message of subscriber) {
 *     console.log(message);
 * }
 * ```
 */
export class FastEventSubscriberClass implements AsyncIterable<TypedFastEventMessage> {
    private _queue: [TypedFastEventMessage, number][] = [];
    private _resolvers: Array<(value: TypedFastEventMessage | null) => void> = [];
    private _isIterating: boolean = false;
    private _isClosed: boolean = false;

    constructor(
        public readonly off: () => void,
        public readonly listener: TypedFastEventListener<any, any, any>,
    ) {}

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
     *     using subscriber = emitter.on('event', listener);
     *     // subscriber 在作用域结束时自动调用 off()
     * }
     * ```
     */
    [Symbol.dispose](): void {
        this.off();
    }

    /**
     * 异步迭代器实现
     *
     * @throws {TypeError} 如果迭代器已被并发消费
     */
    async *[Symbol.asyncIterator](): AsyncIterator<TypedFastEventMessage> {
        if (this._isIterating) {
            throw new TypeError("迭代器已被消费，不能多次并发消费同一个订阅者");
        }

        this._isIterating = true;

        try {
            while (!this._isClosed || this._queue.length > 0) {
                const message = await this._dequeue();

                if (message) {
                    yield message;
                } else if (this._isClosed) {
                    break;
                }
            }
        } finally {
            this._isIterating = false;
        }
    }

    /**
     * 将消息加入队列
     * @internal
     */
    _enqueue(message: TypedFastEventMessage): void {
        if (this._isClosed) {
            return;
        }

        // 如果有待等待的消费者，直接传递消息
        if (this._resolvers.length > 0) {
            const resolver = this._resolvers.shift();
            if (resolver) {
                resolver(message);
                return;
            }
        }

        // 加入队列
        this._queue.push([message, Date.now()]);
    }

    /**
     * 从队列中取出消息（异步）
     * @internal
     */
    private async _dequeue(): Promise<TypedFastEventMessage | null> {
        // 检查队列
        if (this._queue.length > 0) {
            return this._queue.shift()![0];
        }

        // 队列为空，等待新消息或关闭
        if (this._isClosed) {
            return null;
        }

        return new Promise((resolve) => {
            this._resolvers.push(resolve);
        });
    }

    /**
     * 关闭订阅者
     * @internal
     */
    _close(): void {
        this._isClosed = true;
        // 唤醒所有等待的消费者
        for (const resolver of this._resolvers) {
            resolver(null);
        }
        this._resolvers = [];
    }
}
