import { FastEvent } from "../event";
import { FastEventListenerArgs, FastEventSubscriber, FastEventOptions, DeepPartial } from '../types';
import { isFastEventMessage } from "../utils/isFastEventMessage";
import { BroadcastEvent, NamespaceDelimiter } from "./consts";
import type { FastEventBus } from "./eventbus";
import { FastEventBusMessage, FastEventBusNodes } from "./types";

export type FastEventBusNodeOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export class FastEventBusNode<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
> extends FastEvent<Events, Meta, Context> {
    eventbus?: FastEventBus<any, any, any>;
    private _subscribers: FastEventSubscriber[] = []
    constructor(options?: DeepPartial<FastEventBusNodeOptions<Meta, Context>>) {
        super(options as any)
        // 用于触发消息到其他节点
        this.options.onBeforeExecuteListener = this._onBeforeExecuteListener.bind(this)
    }

    /**
     * 
     * 
     * 
     * 如果事件名称带有名称空间分隔符::，则说明该触发的消息是要转发到其他节点，
     * 由eventbus进行转发
     * 
     * emit("otherNode@<事件名>") // 在otherNode节点上触发事件
     * emit("@<事件名>") // 在当前总线队象上触发事件
     * 
     * 事件执行前的监听器处理函数
     * 处理带有命名空间前缀的事件,格式为 "<节点id>::<事件名>"
     * 如果事件包含命名空间,则将事件转发到对应节点或全局事件总线
     * 
     * @param message - 事件消息对象
     * @param args - 事件监听器参数
     * @returns {boolean} false 表示取消在内部触发事件,undefined 表示继续执行
     * @private
     */
    private _onBeforeExecuteListener(message: FastEventBusMessage, args: FastEventListenerArgs) {
        // 处理包括名称空间前缀的事件,即emit("<节点id>::<事件名>")
        if (message.type.includes(NamespaceDelimiter)) {
            message.type = message.type.replace(NamespaceDelimiter, this.eventbus!.options.delimiter)
            message.from = this.id
            return this.eventbus!.emit(message, args)
        }
    }

    /**
     * 加入事件总线
     * @param eventBus 要加入的事件总线
     */
    connect(eventbus: FastEventBus): void {
        this.eventbus = eventbus
        this.eventbus.add(this);
        // 订阅广播事件，以便能接收到广播消息
        this._subscribers.push(this.eventbus.on(`${BroadcastEvent}${this.eventbus.options.delimiter}**`, this.onMessage.bind(this)))
        // 订阅点对点发送给当前节点的消息
        this._onSubscribeForNode()

    }
    disconnect() {
        this.eventbus?.remove(this.id);
    }
    /**
     * 为当前节点订阅消息
     * 
     * 创建一个订阅,监听发送给当前节点的所有事件。
     * 使用节点ID作为前缀过滤消息,并在处理消息时移除该前缀。
     * 
     * 在Eventbus中的所有以`node::<节点id>/<事件>`的事件均会被转发到当前节点
     * 
     * @private
     */
    private _onSubscribeForNode() {
        const prefix = `${this.id}${this.eventbus!.options.delimiter}`
        // 订阅发送给自己的事件
        this._subscribers.push(this.eventbus!.on(`${prefix}**`, (message, args) => {
            // @ts-ignore
            message.type = message.type.substring(prefix.length)
            return this.onMessage.call(this, message, args)
        }))
    }
    /**
     * 发送点对点消息到指定节点
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<R = any>(toNodeId: FastEventBusNodes, payload: any, args?: FastEventListenerArgs): R[]
    send<R = any>(toNodeId: string, payload: any, args?: FastEventListenerArgs): R[] {
        this._assertConnected()
        const message: FastEventBusMessage = {
            type: 'data',
            from: this.id,
            to: toNodeId,
            payload
        }
        return this.eventbus!.send(message, args)
    }

    private _assertConnected() {
        if (!this.eventbus) {
            throw new Error('Node is not connected to any event bus');
        }
    }

    /**
     * 广播消息到所有其他节点
     * 
     * 
     * @param message 要广播的消息
     */
    broadcast<R = any>(payload: any, args?: FastEventListenerArgs): R[]
    broadcast<R = any>(message: FastEventBusMessage, args?: FastEventListenerArgs): R[]
    broadcast<R = any>(): R[] {
        this._assertConnected()
        const isMessage = isFastEventMessage(arguments[0])
        const message: FastEventBusMessage = Object.assign({
            type: isMessage ? arguments[0].type : 'data',
            from: this.id,
        }, isMessage ? arguments[0] : {
            payload: arguments[0]
        })
        return this.eventbus!.broadcast(message, arguments[1])
    }

    /**
     * 处理接收到的消息
     * 供子类继承重载
     */
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMessage(message: FastEventBusMessage, args: FastEventListenerArgs) {

    }
}