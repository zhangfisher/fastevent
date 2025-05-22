import { FastEventListener, FastEventListenerArgs, TypedFastEventMessage, FastListenerMeta } from "../types";


export type FastListenerExecutor = (listeners: FastListenerMeta[], message: TypedFastEventMessage, args: FastEventListenerArgs,
    // 用来执行监听器的函数，内置一些通用逻辑
    execute: (listener: FastEventListener, message: TypedFastEventMessage, args: FastEventListenerArgs, catchErrors?: boolean) => Promise<any> | any
) => Promise<any[]> | any[]

export type FastListenerExecutorBuilder<T extends Record<string, any>> = (options?: T) => FastListenerExecutor