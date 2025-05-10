import type { IFastListenerExecutor } from "./executors/types"
import { type FastListenerPipe } from "./pipe/types"



export interface FaseEventMessageExtends {

}
// 用来扩展全局Meta类型
export interface FastEventMeta {

}
export type FastEventMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = (
    {
        [K in keyof Events]: {
            type: Exclude<K, number | symbol>
            payload: Events[K]
            meta: FastEventMeta & M & Record<string, any>
        }
    }[Exclude<keyof Events, number | symbol>]
) & FaseEventMessageExtends

// 用于emit方法可使用
export type FastEventEmitMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any
> = (
    {
        [K in keyof Events]: {
            type: Exclude<K, number | symbol>
            payload?: Events[K]
            meta?: Partial<FastEventMeta> & M & Record<string, any>
        }
    }[Exclude<keyof Events, number | symbol>]
) & FaseEventMessageExtends


// 只针对指定类型
export type FastEventListener<
    T extends string = string,
    P = any,
    M = any,
    C = any
> = (this: C, message: FastEventMessage<{
    [K in T]: P
}, M>, args: FastEventListenerArgs<M>) => any | Promise<any>

// 任意事件类型
export type FastEventAnyListener<
    Events extends Record<string, any> = Record<string, any>,
    Meta = never,
    Context = any
> = (this: Context, message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => any | Promise<any>

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
     * 为什么要有一个listener引用? 主要用于移除监听器时使用
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
     *  因为在scope中，为了让监听器可以处理scope的逻辑，对listener进行了包装，
     *  因此在事件注册表中登记的不是listener，而是经过包装的监听器
     *  subscriber.off()        可以正常生效
     *  如果要使用scope.off或emitter.off
     *  需要使用subscriber.listener， subscriber.listener记录了原始的监听器引用
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
    id: string
    debug: boolean
    // 事件分隔符
    delimiter: string
    // 监听器函数执行上下文
    context: Context
    // 当执行监听器函数出错时是否忽略,默认true
    ignoreErrors: boolean
    // 额外的全局元数据，当触发事件时传递给监听器
    meta: Meta
    // 当创建新监听器时回调,返回false中止添加监听器
    onAddListener?: (type: string, listener: FastEventListener, options: FastEventListenOptions<Record<string, any>, Meta>) => boolean | FastEventSubscriber | void
    // 当移除监听器时回调
    onRemoveListener?: (type: string[], listener: FastEventListener) => void
    // 当清空监听器时回调
    onClearListeners?: () => void
    // 当监听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: ((listener: FastEventListener, error: Error, message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta> | undefined) => void)
    // 当执行监听器前时回调,返回false代表取消执行,any[]返回给emit
    onBeforeExecuteListener?: (message: FastEventMessage<any, Meta>, args: FastEventListenerArgs<Meta>) => boolean | void | any[]
    // 当执行监听器后时回调
    onAfterExecuteListener?: (message: FastEventMessage<any, Meta>, returns: any[], listeners: FastListenerNode[]) => void
    /**
     * 全局执行器
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个监听器
     * sequence: 按照监听器添加顺序依次执行
     */
    executor?: FastListenerExecutorArgs
    // 默认监听器，优先级高类方法onMessage
    onMessage?: FastEventListener
    // 是否展开emit返回值,默认为false
    expandEmitResults?: boolean
}

export interface FastEvents {

}

export type PickScopeEvents<T extends Record<string, any>, Prefix extends string> = {
    [K in keyof T as K extends `${Prefix}/${infer Rest}` ? Rest : never]: T[K];
};
export type ScopeEvents<T extends Record<string, any>, Prefix extends string> = PickScopeEvents<T, Prefix>

export type FastEventListenOptions<
    Events extends Record<string, any> = Record<string, any>,
    Meta = any
> = {
    // 侦听执行次数，当为1时为单次侦听，为0时为永久侦听，其他值为执行次数,每执行一次减一，减到0时移除监听器
    count?: number
    // 将监听器添加到监听器列表的头部
    prepend?: boolean
    filter?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // 当执行监听器前，如果此函数返回true则自动注销监听
    off?: (message: FastEventMessage<Events, Meta>, args: FastEventListenerArgs<Meta>) => boolean
    // 对监听器函数进行包装装饰，返回包装后的函数
    pipes?: FastListenerPipe[]
}

export type FastListenerExecutorArgs = 'default' | 'parallel' | 'race' | 'balance' | 'first' | 'last' | 'random' | IFastListenerExecutor;

export type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: Partial<M> & Record<string, any>;
    abortSignal?: AbortSignal;               // 用于传递给监听器函数
    /**
     * 
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个监听器
     * sequence: 按照监听器添加顺序依次执行
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

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type OptionalItems<T, K extends keyof T> = Expand<
    Omit<T, K> & { [P in K]?: T[P] }
>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}

export type Fallback<T, F> =
    [T] extends [never] ? F :  // 处理never情况
    T extends undefined ? F :  // 处理undefined情况 
    T;                                // 否则返回原类型



export type ChangeFieldType<Record, Name extends string, Type = any> = Expand<Omit<Record, Name> & {
    [K in Name]: Type
}>

// 用当继承FastEvent时重载Options使用
export type OverrideOptions<T> = ChangeFieldType<Required<T>, 'context', never>

export type ObjectKeys<T, I = string> = { [P in keyof T]: P extends I ? P : never }[keyof T];



/**
 * 从类型数组中移除重复项，返回保留唯一类型的元组
 * @template T - 输入的任意类型数组（元组）
 * @template Result - 内部使用的累积结果数组（默认空数组）
 * @returns {any[]} 去重后的类型元组，保留首次出现的顺序
 * 
 * @example
 * type T1 = Unique<[number, string, number]>;  // [number, string]
 * type T2 = Unique<[1, 2, 2, 3]>;              // [1, 2, 3]
 * type T3 = Unique<['a', 'b', 'a']>;           // ['a', 'b']
 */
export type Unique<T extends any[], Result extends any[] = []> =
    T extends [infer First, ...infer Rest]
    ? First extends Result[number]
    ? Unique<Rest, Result>
    : Unique<Rest, [...Result, First]>
    : Result;

export type Overloads<T> = Unique<
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6
        (...args: infer A7): infer R7;
        (...args: infer A8): infer R8
    } ?
    [(...args: A1) => R1, ((...args: A2) => R2), ((...args: A3) => R3), ((...args: A4) => R4), ((...args: A5) => R5), ((...args: A6) => R6), ((...args: A7) => R7), ((...args: A8) => R8)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6
        (...args: infer A7): infer R7
    } ?
    [(...args: A1) => R1, ((...args: A2) => R2), ((...args: A3) => R3), ((...args: A4) => R4), ((...args: A5) => R5), ((...args: A6) => R6), ((...args: A7) => R7)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6
    } ?
    [(...args: A1) => R1, ((...args: A2) => R2), ((...args: A3) => R3), ((...args: A4) => R4), ((...args: A5) => R5), ((...args: A6) => R6)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4
        (...args: infer A5): infer R5
    } ?
    [(...args: A1) => R1, ((...args: A2) => R2), ((...args: A3) => R3), ((...args: A4) => R4), ((...args: A5) => R5)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4
    } ?
    [(...args: A1) => R1, ((...args: A2) => R2), ((...args: A3) => R3), ((...args: A4) => R4)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3
    } ?
    [((...args: A1) => R1), ((...args: A2) => R2), ((...args: A3) => R3)] :
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2
    } ?
    [((...args: A1) => R1), ((...args: A2) => R2)] :
    T extends {
        (...args: infer A1): infer R1
    } ?
    [(...args: A1) => R1] :
    [T]
>


export type Dict<V = any> = Record<Exclude<string, number | symbol>, V>