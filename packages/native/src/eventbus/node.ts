import { FastEvent } from "../event";
import { FastEventListenerArgs, FastEventSubscriber, FastEventOptions, DeepPartial, TypedFastEventListener, FastEventListenOptions } from '../types';
import { expandable } from "../utils/expandable";
import { BroadcastEvent, NamespaceDelimiter } from "./consts";
import type { FastEventBus } from "./eventbus";
import { FastEventBusEvents, FastEventBusEventTypes, FastEventBusMessage, FastEventBusNodeIds } from "./types";
import { parseBroadcaseArgs } from "./utils";

export type FastEventBusNodeOptions<
    Meta = Record<string, any>,
    Context = any
> = FastEventOptions<Meta, Context> & {

}

export class FastEventBusNode<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never
> extends FastEvent<Events, Meta, Context> {
    eventbus?: FastEventBus<any, any, any>;
    private _subscribers: FastEventSubscriber[] = []
    constructor(options?: DeepPartial<FastEventBusNodeOptions<Meta, Context>>) {
        super(options as any)
        // 用于触发消息到其他节点
        this.options.onBeforeExecuteListener = this._onBeforeExecuteListener.bind(this)
        this.options.onAddListener = this._onAddListener.bind(this)
        // 订阅发送给自己的消息
        this._subscribers.push(this.on('data'))
    }
    /**
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
    private _onAddListener(type: string, listener: TypedFastEventListener, options: FastEventListenOptions) {
        // 以::开头代表在其他节点订阅事件
        if (type.includes(NamespaceDelimiter)) {
            const [nodeId, eventName] = type.split(NamespaceDelimiter)
            if (nodeId === this.id) {
                // 如果是当前节点的事件，则直接监听
                return
            }
            // 订阅其他节点的事件，可以直接在eventbus.nodes.get(id)获取其他节点实例，然后进行订阅
            // 但是这样会存在一个问题，目标节点必须是存在的，否则不会成功。
            // 设计目标是支持节点延迟connect时也可以订阅，并且也可以正常取消 
            // 解决方案：
            // 前提：由于每个节点连接时均会触发node:connect/<node.id>，并且retain=true
            //   - 无论节点是否已经注册均返回once($connect/<node.id>) 
            //    如果节点已经注册，则马上会得到了执行监听器，在监听器中就可以得到目标节点实例，然后注册即可
            //    如果节点还没有注册，订阅者也可以通过取消once来取消订阅。
            //  所以可以监听此消息，如果节点已连接则马上就可以在目标节点上注册表监听器
            //   如果目标节点还没有注册也可以注销
            let targetSubscriber: FastEventSubscriber | undefined
            const subscriber = this.eventbus!.on(`$connect${this.options.delimiter}*`, (message) => {
                if (message.payload === nodeId) {
                    const targetNode = this.eventbus!.nodes.get(nodeId)
                    if (targetNode) {
                        targetSubscriber = targetNode.on(eventName, listener, options)
                    }
                    subscriber.off()
                }
            })
            // 动态切换订阅
            return {
                off: () => targetSubscriber ? targetSubscriber.off() : subscriber.off(),
                listener: targetSubscriber ? targetSubscriber.listener : subscriber.listener
            }
        }
    }
    /**
     * 加入事件总线
     * @param eventBus 要加入的事件总线
     */
    connect(eventbus: FastEventBus<any>): void {
        this.eventbus = eventbus
        this.eventbus.add(this);
        // 订阅广播事件，以便能接收到广播消息
        this._subscribers.push(this.eventbus.on(`${BroadcastEvent}${this.eventbus.options.delimiter}**`, this.onMessage.bind(this)))
        // 订阅点对点发送给当前节点的消息
        this._onSubscribeForNode()

    }
    disconnect() {
        this.eventbus?.remove(this.id);
        this._subscribers.forEach(subscriber => subscriber.off())
    }
    /**
     * 
     * 订阅来自其他节点的消息
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
            return expandable(this.emit(message, args))
        }))
    }
    /**
     * 发送点对点消息到指定节点
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<R = any, T extends FastEventBusNodeIds = FastEventBusNodeIds>(toNodeId: T, payload: any, args?: FastEventListenerArgs): R[]
    send<R = any, T extends string = string>(toNodeId: T, payload: any, args?: FastEventListenerArgs): R[]
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
    broadcast<R = any, T extends FastEventBusEventTypes = FastEventBusEventTypes>(message: FastEventBusMessage<{ [K in T]: K extends FastEventBusEventTypes ? FastEventBusEvents[K] : any }>, args?: FastEventListenerArgs): R[]
    broadcast<R = any, T extends string = string>(message: FastEventBusMessage<{ [K in T]: K extends FastEventBusEventTypes ? FastEventBusEvents[K] : any }, Meta>, args?: FastEventListenerArgs): R[]
    broadcast<R = any, T extends FastEventBusEventTypes = FastEventBusEventTypes>(type: T, payload: FastEventBusEvents[T], options?: FastEventListenerArgs<Meta>): R[]
    broadcast<R = any, T extends string = string>(type: T, payload: T extends FastEventBusEventTypes ? FastEventBusEvents[T] : any, options?: FastEventListenerArgs<Meta>): R[]
    broadcast<R = any>(): R[] {
        this._assertConnected()
        const [message, args] = parseBroadcaseArgs(arguments, this.options.delimiter)
        message.from = this.id
        return this.eventbus!.broadcast(message, args)
    }

    /**
     * 处理接收到的消息
     * 供子类继承重载
     */
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMessage(message: FastEventBusMessage, args: FastEventListenerArgs) {

    }
}