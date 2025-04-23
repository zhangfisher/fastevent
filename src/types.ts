


export type FastEventMessage<T = string, P = any, M = unknown> = {
    type: T
    payload: P
    meta: M
}


export type FastEventListener<
    T = string,
    P = any,
    M = unknown
> = (message: FastEventMessage<T, P, M>) => any | Promise<any>

export type FastListenerNode = {
    __listeners: (FastEventListener<any, any, any> | [FastEventListener<any, any>, number])[];
} & {
    [key: string]: FastListenerNode
}

export type FastEventSubscriber = {
    off: () => void
}

export interface FastEventListenerMeta {
    emitter?: string
}

export type FastListeners = FastListenerNode

export type FastEventOptions<M = unknown> = {
    // 事件分隔符
    delimiter?: string
    // 侦听器函数执行上下文
    context?: any
    // 当执行侦听器函数出错时是否忽略,默认true
    ignoreErrors?: boolean
    // 当侦听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: ((type: string, error: Error) => void)
    // 额外的全局元数据，当触发事件时传递给侦听器
    meta?: M
    // 当创建新侦听器时回调
    onAddListener?: (type: string[], listener: FastEventListener) => void
    // 当移除侦听器时回调
    onRemoveListener?: (type: string[], listener: FastEventListener) => void
}

export type FastEvents = Record<string, any>


export type ScopeEvents<T extends Record<string, any>, Prefix extends string> = {
    [K in keyof T as K extends `${Prefix}/${infer Rest}` ? Rest : never]: T[K];
};

export type FastEventListenOptions = {
    // 侦听执行次数，当为1时为单次侦听，为0时为永久侦听，其他值为执行次数,每执行一次减一，减到0时移除侦听器
    count?: number
    // 将侦听器添加到侦听器列表的头部
    prepend?: boolean
}
