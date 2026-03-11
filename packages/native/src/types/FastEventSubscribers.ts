import { TypedFastEventMessage } from "./FastEventMessages";
import { TypedFastEventListener } from "./FastEventListeners";

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
