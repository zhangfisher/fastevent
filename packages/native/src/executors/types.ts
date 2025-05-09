import { FastEventListener, FastEventListenerArgs, FastEventMessage, FastListenerMeta } from "../types";


export type IFastListenerExecutor = (listeners: FastListenerMeta[], message: FastEventMessage, args: FastEventListenerArgs,
    // 用来执行监听器的函数，内置一些通用逻辑
    execute: (listener: FastEventListener, message: FastEventMessage, args: FastEventListenerArgs) => Promise<any> | any
) => Promise<any[]> | any[]

export type IFastListenerExecutorBuilder<T extends Record<string, any>> = (options?: T) => IFastListenerExecutor