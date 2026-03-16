/**
 * 事件相关
 */
import { TypedFastEventMessage, FastEventMessage } from "./FastEventMessages";
import { FastEventSubscriber } from "./FastEventSubscribers";
import { TypedFastEventListener, FastEventListenerNode } from "./FastEventListeners";
import type { FastListenerExecutor } from "../executors";
import type { FastListenerPipe } from "../pipes";
import { DeepPartial } from "./utils/DeepPartial";
import { FastEventIteratorOptions } from "../utils/eventIterator";

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
    /**
     * 是否展开emit返回值,默认为false，用于将事件转发给其他FastEvent时使用
     */
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
     * 异步迭代器选项
     *
     * 用于配置返回异步迭代器的参数
     * 
     * 默认值是
        {
            overflow: "expand",
            size: 10,
            maxExpandSize: 100,
        }
     */
    iterable?: FastEventIteratorOptions;
};

export enum FastEventListenerFlags {
    Transformed = 1,
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
