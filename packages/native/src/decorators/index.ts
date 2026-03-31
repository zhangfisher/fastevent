import { FastEvent } from "../event";
import { FastEventListenOptions } from "../types";
import { createMethodListener } from "./MethodListener";
import { isPropertyDecorator } from "../utils/isPropertyDecorator";
import { isMethodDecorator } from "../utils/isMethodDecorator";

/**
 *
 * 提供一些类装饰器，用于简化事件监听的代码
 *
 * const emitter = new FastEvent()
 *
 * class MyClass{
 *
 *    // 监听事件时传入onEvent,this指向的是当前类实例
 *    @emitter.on("event",options)
 *    onEvent(message,args){
 *    }
 *
 *    // 监听事件时传入onEvent,this指向的是当前类实例
 *    @emitter.once("event",options)
 *    onEvent(message,args){
 *    }
 *    @emitter.onAny(options)
 *    onEvent(message,args){
 *    }
 *    // 将接收到的消息的message.payload值写入count
 *    @emitter.on("event",options)
 *    count:number = 0
 *
 *
 *
 * }
 *
 * const my= new MyClass()
 *
 * // 取消所有订阅
 * my._subscribers.off()
 *
 *
 *
 */
export function createMagicListener(
    this: FastEvent,
    type: string,
    options: FastEventListenOptions,
) {
    return (target: object, name: string, descriptor: any) => {
        // 装饰类方法
        if (isMethodDecorator(target, name, descriptor)) {
            return createMethodListener.call(this, {
                target,
                name,
                descriptor,
                type,
                listenerOptions: options,
            });
        } else if (isPropertyDecorator(target, name, descriptor)) {
        }
    };
}
