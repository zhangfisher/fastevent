import { FastEventSubscriber } from "../../dist";
import { FastEvent } from "../event";
import { FastEventListenerArgs, FastEventMessage, FastEventOptions } from "../types";
import { BroadcastEvent } from "./consts";
import type { FastEventBus } from "./eventbus";
import { FastEventBusMessage, NamespaceDelimiter } from "./types";

export type FastEventBusNodeOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export class FastEventBusNode<
    Events extends Record<string, any> = Record<string, any>,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
> extends FastEvent<Events, Meta, Context> {
    eventbus?: FastEventBus<any, any, any>;
    private _subscribers: FastEventSubscriber[] = []
    constructor(options?: FastEventBusNodeOptions<Meta, Context>) {
        super(options)
        this.options.onBeforeExecuteListener = this._onBeforeExecuteListener.bind(this)
    }

    /**
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
            return this.eventbus?.send(message)
        }
    }

    /**
     * 加入事件总线
     * @param eventBus 要加入的事件总线
     */
    connect(eventbus: FastEventBus): void {
        this.eventbus = eventbus
        this.eventbus.add(this);

        // 订阅广播事件
        this._subscribers.push(this.eventbus.on(BroadcastEvent, this._onMessage.bind(this)))
    }
    disconnect() {
        if (!this.eventbus) {
            throw new Error('Node is not connected to any event bus');
        }
        this.eventbus.remove(this.id);
    }
    /**
     * 发送消息到指定节点
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<T extends FastEventBusMessage>(toNodeId: string, message: T): void {
        if (!this.eventbus) {
            throw new Error('Node is not connected to any event bus');
        }
        const toNode = this.eventbus.nodes.get(toNodeId);
        if (!toNode) {
            throw new Error(`Node ${toNodeId} not found`);
        }
        toNode.onMessage(message);
    }

    /**
     * 广播消息到所有其他节点
     * @param message 要广播的消息
     */
    broadcast<T extends FastEventMessage>(message: T): void {
        if (!this.eventbus) {
            throw new Error('Node is not connected to any event bus');
        }
        message.from = this.id
        this.eventbus.broadcast(message);
    }

    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    _onMessage<T extends FastEventBusMessage>(message: FastEventBusMessage<T>): void {

    }
    /**
     * 供子类继承重载
     */
    onMessage(message: FastEventBusMessage) {
    }
}