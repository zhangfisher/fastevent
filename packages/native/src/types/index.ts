import type { FastListenerExecutor } from "../executors/types";
import { type FastListenerPipe } from "../pipes/types";
import { ExpandWildcard, ReplaceWildcard } from "./ExpandWildcard";
import { AssertRecord, IsAny, KeyOf, RemoveEmptyObject } from "./utils";
import { GetClosestEvents, GetMatchedEvents } from "./WildcardEvents";

// 用来扩展全局Meta类型
export interface FastEventMeta {}
export interface FastEventMessageExtends {}

export type FastEventMessage<
    P = any,
    M extends Record<string, any> = Record<string, any>,
    T extends string = string,
> = {
    type: T;
    payload: P;
    meta?: M & Partial<FastEventMeta>;
} & FastEventMessageExtends;

export type TypedFastEventMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
> = ({
    // 处理通配符键
    [K in keyof Events as K extends `${string}*${string}` | `*`
        ? ReplaceWildcard<K & string>
        : never]: {
        type: ReplaceWildcard<K & string>;
        payload: Events[K];
        meta: FastEventMeta & M & Record<string, any>;
    };
} & {
    // 处理非通配符键
    [K in keyof Events as K extends `${string}*${string}` | `*` ? never : K]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta: FastEventMeta & M & Record<string, any>;
    };
})[Exclude<keyof Events, number | symbol>] &
    FastEventMessageExtends;

// 用于构建消息时使用，meta是可选的
export type TypedFastEventMessageOptional<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
        meta?: DeepPartial<FastEventMeta & M & Record<string, any>>;
    };
}[Exclude<keyof Events, number | symbol>] &
    FastEventMessageExtends;

// 用于emit方法使用
export type FastEventEmitMessage<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload?: Events[K];
        meta?: DeepPartial<FastEventMeta & M & Record<string, any>>;
    };
}[Exclude<keyof Events, number | symbol>] &
    FastEventMessageExtends;

export type FastMessagePayload<P = any> = {
    type: P;
    __IS_FAST_MESSAGE__: true;
};

/**
 * 通用事件消息类型
 * @description 根据 Events 类型生成联合类型，每个成员包含 type 和 payload 字段
 *
 * @example
 * type Events = {
 *     userCreated: { id: number; name: string };
 *     userDeleted: number;
 *     statusChanged: 'active' | 'inactive';
 * };
 *
 * type Message = FastEventCommonMessage<Events>;
 * // 等价于:
 * // type Message = {
 * //     type: 'userCreated';
 * //     payload: { id: number; name: string };
 * // } | {
 * //     type: 'userDeleted';
 * //     payload: number;
 * // } | {
 * //     type: 'statusChanged';
 * //     payload: 'active' | 'inactive';
 * // }
 */
export type FastEventCommonMessage<Events extends Record<string, any>> = {
    [K in keyof Events]: {
        type: Exclude<K, number | symbol>;
        payload: Events[K];
    };
}[Exclude<keyof Events, number | symbol>];

/**
 * 支持通配符的通用事件消息类型
 * @description 创建一个消息类型，type 可以是任意字符串，payload 类型根据 type 匹配的通配符模式自动推导
 */
export type FastEventWildcardMessage<Events extends Record<string, any>, T extends string> = {
    type: T;
    payload: PickPayload<RecordValues<GetMatchedEvents<Events, T>>>;
};

// 只针对指定类型
export type TypedFastEventListener<T extends string = string, P = any, M = any, C = any> = (
    this: C,
    message: TypedFastEventMessage<Record<T, P>, M>,
    args: FastEventListenerArgs<M>,
) => any | Promise<any>;

// 任意事件类型
export type TypedFastEventAnyListener<
    Events extends Record<string, any> = Record<string, any>,
    Meta = never,
    Context = any,
> = (
    this: Context,
    message: TypedFastEventMessage<Events, Meta>,
    args: FastEventListenerArgs<Meta>,
) => any | Promise<any>;

export type FastEventListeners<
    Events extends Record<string, any> = Record<string, any>,
    M = any,
    C = any,
> = {
    [K in keyof Events]: TypedFastEventListener<Exclude<K, number | symbol>, Events[K], M, C>;
};

// 标准监听器
export type FastEventListener<
    P = any,
    M extends Record<string, any> = Record<string, any>,
    T extends string = string,
> = (message: FastEventMessage<P, M, T>, args: FastEventListenerArgs<M>) => any | Promise<any>;

// 通用监听器， 允许指定消息类型
export type FastEventCommonListener<
    Message = FastEventMessage,
    Meta extends Record<string, any> = Record<string, any>,
    Context = any,
> = (this: Context, message: Message, args: FastEventListenerArgs<Meta>) => any | Promise<any>;

/**
 * [
 *      监听器函数引用，
 *      需要执行多少次，                     =0代表不限
 *      实际执行的次数(用于负载均衡时记录)
 *      标签            用于调试一般可以标识监听器类型或任意信息
 *      标识
 * ]
 */
export type FastEventListenerMeta = [
    TypedFastEventListener<any, any>,
    number,
    number,
    string,
    number,
];

export type FastEventListenerNode = {
    __listeners: FastEventListenerMeta[];
} & {
    [key: string]: FastEventListenerNode;
};

/**
 * FastEvent 订阅者类型
 *
 * @description
 * 当使用 { iterable: true } 选项时，返回的订阅者对象支持异步迭代，
 * 可以使用 for await...of 语法消费事件消息。
 *
 * @example
 * ```ts
 * // 普通订阅者（不启用 iterable）
 * const subscriber1 = emitter.on('event', listener);
 * subscriber1.off();
 *
 * // 可迭代订阅者（启用 iterable）
 * const subscriber2 = emitter.on('event', null, { iterable: true });
 * for await (const message of subscriber2) {
 *     console.log(message);
 * }
 * ```
 */
export type FastEventSubscriber = {
    /**
     * 取消订阅
     */
    off: () => void;
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
    readonly listener: TypedFastEventListener<any, any, any>;
    /**
     * 异步迭代器（仅当启用 iterable 时可用）
     */
    [Symbol.asyncIterator]?: () => AsyncIterator<TypedFastEventMessage>;
} & {
    /**
     * 将消息加入队列（内部方法，仅当启用 iterable 时可用）
     * @internal
     */
    _enqueue?: (message: TypedFastEventMessage) => void;
    /**
     * 关闭订阅者（内部方法，仅当启用 iterable 时可用）
     * @internal
     */
    _close?: () => void;
};

export type FastListeners = FastEventListenerNode;

export type FastEventOptions<Meta = Record<string, any>, Context = never> = {
    id: string;
    debug: boolean;
    // 事件分隔符
    delimiter: string;
    // 监听器函数执行上下文
    context: Context;
    // 当执行监听器函数出错时是否忽略,默认true
    ignoreErrors: boolean;
    // 额外的全局元数据，当触发事件时传递给监听器
    meta: Meta;
    // 当创建新监听器时回调,返回false中止添加监听器
    onAddListener?: (
        type: string,
        listener: TypedFastEventListener,
        options: FastEventListenOptions<Record<string, any>, Meta>,
    ) => boolean | FastEventSubscriber | void;
    // 当移除监听器时回调
    onRemoveListener?: (type: string, listener: TypedFastEventListener) => void;
    // 当清空监听器时回调
    onClearListeners?: () => void;
    // 当监听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
    onListenerError?: (
        error: Error,
        listener: TypedFastEventListener,
        message: TypedFastEventMessage<any, Meta>,
        args: FastEventListenerArgs<Meta> | undefined,
    ) => void;
    // 当执行监听器前时回调,返回false代表取消执行,any[]返回给emit
    onBeforeExecuteListener?: (
        message: TypedFastEventMessage<any, Meta>,
        args: FastEventListenerArgs<Meta>,
    ) => boolean | void | any[];
    // 当执行监听器后时回调
    onAfterExecuteListener?: (
        message: TypedFastEventMessage<any, Meta>,
        returns: any[],
        listeners: FastEventListenerNode[],
    ) => void;
    /**
     * 全局执行器
     */
    executor?: FastListenerExecutor;
    // 默认监听器，优先级高类方法onMessage
    onMessage?: TypedFastEventListener;
    // 是否展开emit返回值,默认为false，用于将事件转发给其他FastEvent时使用
    expandEmitResults?: boolean;
    /**
     * 对接收到的消息进行转换，用于将消息转换成其他格式
     *
     * new FastEvent({
     *    transform:(message)=>{
     *        message.payload
     *    }
     * })
     */
    transform?: (message: FastEventMessage) => any;
};

export interface FastEvents {}

export type FastEventListenOptions<
    Events extends Record<string, any> = Record<string, any>,
    Meta = any,
> = {
    // 侦听执行次数，当为1时为单次侦听，为0时为永久侦听，其他值为执行次数,每执行一次减一，减到0时移除监听器
    count?: number;
    // 将监听器添加到监听器列表的头部
    prepend?: boolean;
    // 该监听器会在其他监听器执行完毕后再触发执行
    flags?: number;
    filter?: (
        message: TypedFastEventMessage<Events, Meta>,
        args: FastEventListenerArgs<Meta>,
    ) => boolean;
    // 当执行监听器前，如果此函数返回true则自动注销监听
    off?: (
        message: TypedFastEventMessage<Events, Meta>,
        args: FastEventListenerArgs<Meta>,
    ) => boolean;
    // 对监听器函数进行包装装饰，返回包装后的函数
    pipes?: FastListenerPipe[];
    /**
     * 为监听器添加一个tag，在监听器注册表中记录,用于调试使用
     * emitter.on(type,listener,{tag:"x"})
     * emitter.getListeners(tag)
     */
    tag?: string;
    /**
     * 启用异步迭代器功能
     * @default false
     * @description
     * 当设置为 true 时，返回的订阅者对象支持异步迭代，可以使用 for await...of 语法消费事件消息。
     * 默认会添加 queue() pipe 来缓存消息，用户可以通过 pipes 选项覆盖默认行为。
     *
     * @example
     * ```ts
     * const subscriber = emitter.on('event', null, { iterable: true });
     * for await (const message of subscriber) {
     *     console.log(message);
     * }
     * ```
     */
    iterable?: boolean;
};

export enum FastEventListenerFlags {
    Transformed = 1, // 标识消息是经过transform转换后的
}

export type FastEventListenerArgs<M = Record<string, any>> = {
    retain?: boolean;
    meta?: DeepPartial<M> & Record<string, any>;
    abortSignal?: AbortSignal; // 用于传递给监听器函数
    /**
     *
     * allSettled: 使用Promise.allSettled()执行所有监听器
     * race: 使用Promise.race()执行所有监听器，只有第一个执行完成就返回,其他监听器执行结果会被忽略
     * balance: 尽可能平均执行各个监听器
     * sequence: 按照监听器添加顺序依次执行
     */
    executor?: FastListenerExecutor;
    /**
     * 当emit参数解析完成后的回调，用于修改emit参数
     */
    parseArgs?: (message: TypedFastEventMessage, args: FastEventListenerArgs) => void;
    /**
     * 额外的标识
     *
     * - 1: transformed 当消息是经过transform转换后的消息时的标识
     *
     */
    flags?: FastEventListenerFlags;
    /**
     * 如果消息经过转换前的原主题
     */
    rawEventType?: string;
};

export type Merge<T extends object, U extends object> = {
    [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;
};

export type RequiredItems<T extends object, Items extends string[]> = Omit<T, Items[number]> & {
    [K in Items[number] & keyof T]-?: Exclude<T[K], undefined>;
};

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;

export type OptionalItems<T, K extends keyof T> = Expand<Omit<T, K> & { [P in K]?: T[P] }>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Fallback<T, F> = [T] extends [never]
    ? F // 处理never情况
    : T extends undefined
      ? F // 处理undefined情况
      : T; // 否则返回原类型

export type ChangeFieldType<Record, Name extends string, Type = any> = Expand<
    Omit<Record, Name> & {
        [K in Name]: Type;
    }
>;

// 用当继承FastEvent时重载Options使用
export type OverrideOptions<T> = ChangeFieldType<Required<T>, "context", never>;

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
export type Unique<T extends any[], Result extends any[] = []> = T extends [
    infer First,
    ...infer Rest,
]
    ? First extends Result[number]
        ? Unique<Rest, Result>
        : Unique<Rest, [...Result, First]>
    : Result;

export type Overloads<T> = Unique<
    T extends {
        (...args: infer A1): infer R1;
        (...args: infer A2): infer R2;
        (...args: infer A3): infer R3;
        (...args: infer A4): infer R4;
        (...args: infer A5): infer R5;
        (...args: infer A6): infer R6;
        (...args: infer A7): infer R7;
        (...args: infer A8): infer R8;
    }
        ? [
              (...args: A1) => R1,
              (...args: A2) => R2,
              (...args: A3) => R3,
              (...args: A4) => R4,
              (...args: A5) => R5,
              (...args: A6) => R6,
              (...args: A7) => R7,
              (...args: A8) => R8,
          ]
        : T extends {
                (...args: infer A1): infer R1;
                (...args: infer A2): infer R2;
                (...args: infer A3): infer R3;
                (...args: infer A4): infer R4;
                (...args: infer A5): infer R5;
                (...args: infer A6): infer R6;
                (...args: infer A7): infer R7;
            }
          ? [
                (...args: A1) => R1,
                (...args: A2) => R2,
                (...args: A3) => R3,
                (...args: A4) => R4,
                (...args: A5) => R5,
                (...args: A6) => R6,
                (...args: A7) => R7,
            ]
          : T extends {
                  (...args: infer A1): infer R1;
                  (...args: infer A2): infer R2;
                  (...args: infer A3): infer R3;
                  (...args: infer A4): infer R4;
                  (...args: infer A5): infer R5;
                  (...args: infer A6): infer R6;
              }
            ? [
                  (...args: A1) => R1,
                  (...args: A2) => R2,
                  (...args: A3) => R3,
                  (...args: A4) => R4,
                  (...args: A5) => R5,
                  (...args: A6) => R6,
              ]
            : T extends {
                    (...args: infer A1): infer R1;
                    (...args: infer A2): infer R2;
                    (...args: infer A3): infer R3;
                    (...args: infer A4): infer R4;
                    (...args: infer A5): infer R5;
                }
              ? [
                    (...args: A1) => R1,
                    (...args: A2) => R2,
                    (...args: A3) => R3,
                    (...args: A4) => R4,
                    (...args: A5) => R5,
                ]
              : T extends {
                      (...args: infer A1): infer R1;
                      (...args: infer A2): infer R2;
                      (...args: infer A3): infer R3;
                      (...args: infer A4): infer R4;
                  }
                ? [
                      (...args: A1) => R1,
                      (...args: A2) => R2,
                      (...args: A3) => R3,
                      (...args: A4) => R4,
                  ]
                : T extends {
                        (...args: infer A1): infer R1;
                        (...args: infer A2): infer R2;
                        (...args: infer A3): infer R3;
                    }
                  ? [(...args: A1) => R1, (...args: A2) => R2, (...args: A3) => R3]
                  : T extends {
                          (...args: infer A1): infer R1;
                          (...args: infer A2): infer R2;
                      }
                    ? [(...args: A1) => R1, (...args: A2) => R2]
                    : T extends {
                            (...args: infer A1): infer R1;
                        }
                      ? [(...args: A1) => R1]
                      : [T]
>;

export type Dict<V = any> = Record<Exclude<string, number | symbol>, V>;

export type RecordValues<R extends Record<string, any>> = R[keyof R];
export type PayloadValues<R extends Record<string, any>> =
    R[keyof R] extends FastMessagePayload<infer P> ? P : R[keyof R];

export type RecordPrefix<P extends string, R extends Record<string, any>> = {
    [K in keyof R as K extends `${P}/${infer S}` ? S : never]: R[K];
};

/**
 * 声明事件类型时，一般情况下，K=事件名称，V=事件Payload参数类型
 *
 * AssertFastMessage用于声明V是一个FastMessage类型，而不是Payload类型
 * 
 * 一般配合transform参数使用
 * 
 * 例如：
 * type CustomEvents = {
       click: NotPayload<{ x: number; y: number }>;
       <事件名称,即type>:<事件负载，即payload>
    }
    常规情况下，事件的K=事件名称，V=事件Payload参数类型

    但是如我们使用了transform对事件进行了转换时，此时接收到的消息可能就不是标准事件消息{type,payload}

    此时可以使用NotPayload或AssertFastMessage类型声明

    const emitter = new FastEvent<CustomEvents>();
    emitter.on('click', (message) => {
        // 因为上面的click事件中使用了NotPayload类型
        // typeof message === { x: number; y: number }
    })
    const emitter = new FastEvent<CustomEvents>({
        transform:(message)=>{
            if(message.type === 'click'){
                return message.payload
            }else{
                return message
            }
        }
    });
    emitter.on('click', (message) => {
        // typeof message === { x: number; y: number }
    }
 */

export type AssertFastMessage<M> = {
    type: M;
    __IS_FAST_MESSAGE__: true;
};

export type NotPayload<M> =
    IsAny<M> extends true
        ? FastMessagePayload<any>
        : [M] extends [FastMessagePayload]
          ? M
          : FastMessagePayload<M>;

export type PickPayload<M> = [M] extends [FastMessagePayload] ? M["type"] : M;

export type AtPayloads<Events extends Record<string, any>> = {
    [K in keyof Events]: PickPayload<Events[K]>;
};

/**
 * 扩展通配符事件类型
 * @description 将包含通配符的事件键扩展为模板字面量类型
 *
 * 优先级：非通配符键 > 单级通配符 > 多级通配符
 * 使用交叉类型实现，确保精确键优先匹配
 */
export type ExtendWildcardEvents<Events extends Record<string, any>> = AssertRecord<
    RemoveEmptyObject<
        {
            // 第一优先级：非通配符键（精确匹配）
            [K in keyof Events as K extends `${string}*${string}` | `*` ? never : K]: Events[K];
        } & {
            // 第二优先级：通配符键扩展
            [K in keyof Events as K extends `${string}*${string}` | `*`
                ? ReplaceWildcard<K & string>
                : never]: Events[K];
        }
    >
>;

export type PickTransformedEvents<T extends Record<string, any>> = ExpandWildcard<{
    [key in keyof T as T[key] extends FastMessagePayload<any> ? key : never]: T[key];
}>;
export type OmitTransformedEvents<T extends Record<string, any>> = {
    [key in keyof T as T[key] extends FastMessagePayload ? never : key]: T[key];
};

// 将事件类型所有成员转换为NotPayload ExtendWildcardEvents
export type TransformedEvents<Events extends Record<string, any>> = {
    [K in keyof Events]: NotPayload<Events[K]>;
};

// 从 TransformedEvents 中获取事件类型（支持通配符匹配）
export type GetEventType<TransformedEvents extends Record<string, any>, T extends string> =
    // 使用 WildcardEvents 来匹配事件键
    GetMatchedEvents<TransformedEvents, T> extends infer Matched
        ? Matched extends Record<string, any>
            ? // GetMatchedEvents 现在返回交集类型，需要转换为联合类型
              { [K in keyof Matched]: Matched[K] }[keyof Matched]
            : never
        : never;

// 专用的类型查询工具，使用原始事件类型
export type GetMatchedEventPayload<Events extends Record<string, any>, T extends string> =
    // 使用 WildcardEvents 来匹配事件，返回原始类型
    GetMatchedEvents<Events, T> extends infer Matched
        ? Matched extends { [key: string]: any }
            ? // 匹配对象类型，提取值类型为联合类型
              // GetMatchedEvents 现在返回交集类型，需要转换为联合类型
              { [K in keyof Matched]: Matched[K] }[keyof Matched]
            : never
        : never;

// export type GetMatchedEventPayload<Events extends Record<string, any>, T extends string> =
//     // 使用 WildcardEvents 来匹配事件，返回原始类型
//     GetMatchedEvents<Events, T> extends infer Matched
//         ? Matched extends { [key: string]: any }
//             ? // 匹配对象类型，提取值类型（会自动分发联合类型）
//               Matched[keyof Matched]
//             : never
//         : never;
export * from "./WildcardEvents";
export * from "./ScopeEvents";
export * from "./ExpandWildcard";
export * from "./Keys";
export * from "./utils";

export type Class = (new (...args: any[]) => any) | (abstract new (...args: any[]) => any);

export type IsTransformedKey<Events extends Record<string, any>, T extends string> =
    // 优先检查：如果 T 是 Events 的精确键，其值必须扩展 FastMessagePayload
    T extends keyof Events
        ? IsAny<Events[T]> extends true
            ? never
            : Events[T] extends FastMessagePayload<any>
              ? T
              : never
        : // 如果不是精确键，使用 GetClosestEvents 获取最精确的通配符匹配
          GetClosestEvents<Events, Exclude<T, number | symbol>> extends infer ClosestEvent
          ? ClosestEvent extends Record<string, any>
              ? // 检查最精确匹配的值类型是否扩展 FastMessagePayload
                IsAny<ClosestEvent[keyof ClosestEvent]> extends true
                  ? never
                  : ClosestEvent[keyof ClosestEvent] extends FastMessagePayload<any>
                    ? T
                    : never
              : never
          : never;

// export type IsTransformedKey<Events extends Record<string, any>, T extends string> =
//     // 优先检查：如果 T 是 Events 的精确键，其值必须扩展 FastMessagePayload
//     T extends keyof Events
//         ? IsAny<Events[T]> extends true
//             ? never
//             : Events[T] extends FastMessagePayload<any>
//               ? T
//               : never
//         : // 如果不是精确键，检查通配符匹配
//           GetMatchedEvents<Events, T> extends infer MatchedEvents
//           ? MatchedEvents extends Record<string, any>
//               ? // 获取所有非全局通配符的匹配键
//                 Exclude<keyof MatchedEvents, "*" | "**"> extends infer NonGlobalKeys
//                   ? NonGlobalKeys extends never
//                       ? // 如果没有非全局通配符匹配，检查全局通配符
//                         keyof MatchedEvents extends "*" | "**"
//                           ? MatchedEvents[keyof MatchedEvents] extends FastMessagePayload<any>
//                               ? T
//                               : never
//                           : never
//                       : // 如果有非全局通配符匹配，检查它们的值类型
//                         CheckWildcardMatch<MatchedEvents, T>
//                   : never
//               : never
//           : never;

/**
 * 检查事件对象的所有值是否都为 FastMessagePayload 类型
 * @description
 * - 如果 Events 为空对象，返回 false
 * - 如果所有值都 extends FastMessagePayload，返回 true
 * - 否则返回 false
 *
 * @example
 * type Test1 = IsTransformed<{ a: FastMessagePayload<string> }>; // true
 * type Test2 = IsTransformed<{ a: FastMessagePayload<string>; b: number }>; // false
 * type Test3 = IsTransformed<{}>; // false
 */
export type IsTransformed<Events extends Record<string, any>> = keyof Events extends never
    ? false
    : {
            [K in keyof Events]: Events[K] extends FastMessagePayload<any> ? true : false;
        }[keyof Events] extends infer Result
      ? [Result] extends [true]
          ? true
          : false
      : false;

/**
 * 从
 */
export type GetPayload<Events extends Record<string, any>, T> = PickPayload<
    RecordValues<
        ExtendWildcardEvents<
            GetClosestEvents<Events, T extends string ? T : string, Record<string, any>>
        >
    >
>;
