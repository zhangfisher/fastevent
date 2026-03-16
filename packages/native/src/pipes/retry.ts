import { TypedFastEventMessage } from "../types/FastEventMessages";
import { TypedFastEventListener } from "../types/FastEventListeners";
import { FastEventListenerArgs } from "../types/FastEvents";
import { isFunction } from "../utils/isFunction";
import { FastListenerPipe } from "./types";
import { delay } from "../utils/delay";

export interface RetryListenerPipeOptions {
    retries?: number; // 重试次数
    interval?: number | ((retryCount: number) => number); // 重试间隔，默认1000ms
    drop?: (message: TypedFastEventMessage, error: Error) => void; // 所有重试失败后的回调
}

/**
 * 创建一个重试管道，在监听器执行失败时自动重试
 * @param retries 最大重试次数
 * @param options 配置选项
 * @returns FastListenerPipe
 */

export function retry(options?: RetryListenerPipeOptions): FastListenerPipe {
    const { retries, interval, drop } = Object.assign(
        {
            retries: 1,
            interval: 100,
        },
        options,
    );

    return (listener: TypedFastEventListener): TypedFastEventListener => {
        return async function (message: TypedFastEventMessage, args: FastEventListenerArgs) {
            let retryCount = 0;
            let lastError: Error | undefined;
            while (retryCount <= retries) {
                try {
                    return await listener.call(this, message, args);
                } catch (error) {
                    lastError = error as Error;
                    retryCount++;
                    if (retryCount <= retries) {
                        await delay(isFunction(interval) ? interval(retryCount) : interval);
                    } else {
                        // 所有重试失败，调用drop回调
                        if (isFunction(drop)) {
                            drop(message, lastError);
                        }
                        throw lastError;
                    }
                }
            }
        };
    };
}
