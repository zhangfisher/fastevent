import { FastEventListenerNode, TypedFastEventListener } from "./FastEventListeners";
import { TypedFastEventMessage } from "./FastEventMessages";
import { FastEventListenerArgs, FastEventListenOptions } from "./FastEvents";
import { FastEventSubscriber } from "./FastEventSubscribers";

export type AddListenerHook = (
    type: string,
    listener: TypedFastEventListener,
    options: FastEventListenOptions<Record<string, any>, any>,
) => boolean | FastEventSubscriber | void;
// 当移除监听器时回调
export type RemoveListenerHook = (type: string, listener: TypedFastEventListener) => void;

// 当清空监听器时回调
export type ClearListenersHook = () => void;
// 当监听器函数执行出错时的回调，用于诊断时使用,可以打印错误信息
export type ListenerErrorHook = (
    error: Error,
    listener: TypedFastEventListener,
    message: TypedFastEventMessage<any, any>,
    args: FastEventListenerArgs<any> | undefined,
) => void;
// 当执行监听器前时回调,返回false代表取消执行,any[]返回给emit
export type BeforeExecuteListenerHook = (
    message: TypedFastEventMessage<any, any>,
    args: FastEventListenerArgs<any>,
) => boolean | void | any[];
// 当执行监听器后时回调
export type AfterExecuteListenerHook = (
    message: TypedFastEventMessage<any, any>,
    returns: any[],
    listeners: FastEventListenerNode[],
) => void;

export type FastEventHooks = {
    AddListener: AddListenerHook[];
    RemoveListener: RemoveListenerHook[];
    ClearListeners: ClearListenersHook[];
    ListenerError: ListenerErrorHook[];
    BeforeExecuteListener: BeforeExecuteListenerHook[];
    AfterExecuteListener: AfterExecuteListenerHook[];
};
