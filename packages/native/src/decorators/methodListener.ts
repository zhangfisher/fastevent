// oxlint-disable typescript/no-this-alias
import { FastEvent } from "../event";
import { FastEventListenOptions } from "../types";

type MethodContext = {
    target: object;
    name: string | symbol;
    descriptor: any;
    type: string;
    listenerOptions: FastEventListenOptions;
};
export function createMethodListener(this: FastEvent, context: MethodContext) {
    const { target, name, descriptor, type, listenerOptions } = context;
    const originalMethod = descriptor.value;

    // 保存 FastEvent 实例的引用
    const emitter = this;

    // 用于追踪实例是否已订阅的 WeakMap
    const subscribedInstances = new WeakMap<object, boolean>();

    // 包装原始方法，确保 this 指向类实例
    const wrappedListener = function (this: any, message: any, ...args: any[]) {
        return originalMethod.call(this, message, ...args);
    };

    // 修改 descriptor.value，在首次调用时订阅事件
    descriptor.value = function (this: any, ...args: any[]) {
        const instance = this;

        // 确保实例有 _subscribers 属性
        if (!instance._subscribers) {
            Object.defineProperty(instance, "_subscribers", {
                value: [],
                writable: true,
                enumerable: false,
                configurable: true,
            });
        }

        // 检查是否已经订阅过这个事件
        if (!subscribedInstances.has(instance)) {
            // 使用 FastEvent 实例的 on 方法订阅
            const subscriber = emitter.on(type, wrappedListener.bind(instance), listenerOptions);

            // 存储订阅信息
            instance._subscribers.push({
                name,
                type,
                subscriber,
            });

            // 标记为已订阅
            subscribedInstances.set(instance, true);
        }

        // 调用原始方法
        return originalMethod.apply(instance, args);
    };

    return descriptor;
}
