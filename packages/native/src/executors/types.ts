import {
    TypedFastEventListener,
    FastEventListenerArgs,
    TypedFastEventMessage,
    FastEventListenerMeta,
} from "../types";

export type FastListenerExecutor = (
    listeners: FastEventListenerMeta[],
    message: TypedFastEventMessage,
    args: FastEventListenerArgs,
    // 用来执行监听器的函数，内置一些通用逻辑
    execute: (
        listener: TypedFastEventListener,
        message: TypedFastEventMessage,
        args: FastEventListenerArgs,
        catchErrors?: boolean,
    ) => Promise<any> | any,
) => Promise<any[]> | any[];

export type FastListenerExecutorBuilder<T extends Record<string, any>> = (
    options?: T,
) => FastListenerExecutor;
