import { TypedFastEventMessage, FastEventMessage } from "./FastEventMessages";
import { FastEventListenerArgs } from "./FastEvents";

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
export type FastListeners = FastEventListenerNode;
