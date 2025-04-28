


export interface FaseEventMessageExtend {

}

export type FastEventMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = (
    {
        [K in keyof Events]: {
            type: Exclude<K, number | symbol>
            payload: Events[K]
            meta: M
        }
    }[Exclude<keyof Events, number | symbol>]
) & FaseEventMessageExtend

// 用于emit方法可使用
export type FastEventEmitMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = (
    {
        [K in keyof Events]: {
            type: Exclude<K, number | symbol>
            payload?: Events[K]
            meta?: M
        }
    }[Exclude<keyof Events, number | symbol>]
) & FaseEventMessageExtend


// 只针对指定类型
export type FastEventListener<
    T extends string = string,
    P = any,
    M = any,
    C = any
> = (this: C, message: FastEventMessage<{
    [K in T]: P
}, M>, args?: FastEventListenerArgs) => any | Promise<any>

// 任意事件类型
export type FastEventAnyListener<
    Events extends Record<string, any> = Record<string, any>,
    Meta = never,
    Context = any
> = (this: Context, message: FastEventMessage<Events, Meta>, args?: FastEventListenerArgs) => any | Promise<any>





/**
 * [监听器函数引用，需要执行多少次，实际执行的次数(用于负载均衡时记录)]
 */
export type FastListenerMeta = [FastEventListener<any, any>, number, number]

export type FastListenerNode = {
    __listeners: FastListenerMeta[];
} & {
    [key: string]: FastListenerNode
}

export type FastEventSubscriber = {
    off: () => void
    /**
     * 为什么要有一个listener引用? 主要用于移除侦听器时使用
     * 
     *  - 正常情况下
     *  const subscriber = emitter.on('event', listener)
     *   
     *  subscriber.off()
     *  emitter.off('event', listener)
     *  emitter.off(listener)
     * 
     *  - 在使用scope时
     *  const scope = emitter.scope("xxx")
     *  const subscriber = scope.on('event', listener)
     * 
     *  subscriber.off()        可以正常生效
     *  scope.off('event', listener)    // 无法生效
     *  scope.off(listener) // 无法生效
     *  因为在scope中，为了让侦听器可以处理scope的逻辑，对listener进行了包装，
     *  因此在事件注册表中登记的不是listener，而是经过包装的侦听器
     *  subscriber.off()        可以正常生效
     *  如果要使用scope.off或emitter.off
     *  需要使用subscriber.listener， subscriber.listener记录了原始的侦听器引用
     *   subscriber.listener===listener
     *  
     *  scope.off('event', subscriber.listener)    // 生效
     *  scope.off(subscriber.listener) // 生效 
     * 
     */
    listener: FastEventListener<any, any, any>
}


export type FastListeners = FastListenerNode

export type FastEventOptions<Meta = Record<string, any>, Context = any> = {
    id?: string
    debug?: boolean
    // 事件分隔符
    delimiter?: string
    // 侦听器函数执行上下文
    context?: Context
    // 当执行侦听器函数出错时是否忽略,默认true
    ignoreErrors?: boolean
    // 当侦听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: ((type: string, error: Error) => void)
    // 额外的全局元数据，当触发事件时传递给侦听器
    meta?: Meta
    // 当创建新侦听器时回调
    onAddListener?: (type: string[], listener: FastEventListener) => void
    // 当移除侦听器时回调
    onRemoveListener?: (type: string[], listener: FastEventListener) => void
    // 当清空侦听器时回调
    onClearListeners?: () => void
    // 当执行侦听器前时回调,返回false代表取消执行
    onBeforeExecuteListener?: (message: FastEventMessage, args: FastEventListenerArgs) => boolean | void
    // 当执行侦听器后时回调
    onAfterExecuteListener?: (message: FastEventMessage, returns: any[], listeners: FastListenerNode[]) => void
    /**
     * 全局执行器
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个侦听器
     * sequence: 按照侦听器添加顺序依次执行
     */
    executor?: FastListenerExecutorArgs
}


export type FastEvents = Record<string, any>


export type PickScopeEvents<T extends Record<string, any>, Prefix extends string> = {
    [K in keyof T as K extends `${Prefix}/${infer Rest}` ? Rest : never]: T[K];
};
export type ScopeEvents<T extends Record<string, any>, Prefix extends string> = PickScopeEvents<T, Prefix>


export type FastEventListenOptions = {
    // 侦听执行次数，当为1时为单次侦听，为0时为永久侦听，其他值为执行次数,每执行一次减一，减到0时移除侦听器
    count?: number
    // 将侦听器添加到侦听器列表的头部
    prepend?: boolean
    filter?: (message: FastEventMessage) => boolean
}

export type FastListenerExecutorArgs = 'default' | 'allSettled' | 'race' | 'balance' | 'first' | 'last' | 'random' | IFastListenerExecutor;

export type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Record<string, any> & Partial<M>;
    abortSignal?: AbortSignal;               // 用于传递给监听器函数
    /**
     * 
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个侦听器
     * sequence: 按照侦听器添加顺序依次执行
     */
    executor?: FastListenerExecutorArgs
}

export type Merge<T extends object, U extends object> = {
    [K in keyof T | keyof U]:
    K extends keyof U ? U[K] :
    K extends keyof T ? T[K] :
    never;
};


export type RequiredItems<T extends object, Items extends string[]> = Omit<T, Items[number]> & {
    [K in Items[number] & keyof T]-?: Exclude<T[K], undefined>;
};



export type Fallback<T, F> =
    [T] extends [never] ? F :  // 处理never情况
    T extends undefined ? F :  // 处理undefined情况
    T;                                // 否则返回原类型



export type IFastListenerExecutor = (listeners: FastListenerMeta[], message: FastEventMessage, args: FastEventListenerArgs | undefined,
    // 用来执行监听器的函数，内置一些通用逻辑
    execute: (listener: FastEventListener, message: FastEventMessage, args?: FastEventListenerArgs) => Promise<any> | any
) => Promise<any[]> | any[] 