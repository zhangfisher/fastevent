import { FastEvent } from "../event";
import { FastEventListenerArgs, FastEventOptions, FastEvents } from "../types";
import { FastEventBus } from "./eventbus";
import { FastEventBusNodeMessage, NamespaceDelimiter } from "./types";

export type FastEventBusNodeOptions<Meta = Record<string, any>, Context = any> = FastEventOptions<Meta, Context>

export class FastEventBusNode<
    Events extends FastEvents = FastEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    Types extends keyof Events = Exclude<keyof Events, number | symbol>
> extends FastEvent<EventSource, Meta, Context> {
    eventBus?: FastEventBus;
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
    private _onBeforeExecuteListener(message: FastEventBusNodeMessage, args: FastEventListenerArgs) {
        // 处理包括名称空间前缀的事件,即emit("<节点id>::<事件名>")
        if (message.type.includes(NamespaceDelimiter)) {
            const [namespace, type] = message.type.split(NamespaceDelimiter)
            const emitter = (namespace ? this.eventBus?.nodes.get(namespace) : this.eventBus!) as FastEvent
            if (!emitter) {
                throw new Error(`Node ${namespace} not found`);
            } else { // 转发到全局或其他节点触发事件
                message.type = type
                emitter.emit(message, args)
            }
            return false // 取消在内部触发事件
        }
    }

    /**
     * 加入事件总线
     * @param eventBus 要加入的事件总线
     */
    connect(eventBus: FastEventBus): void {
        this.eventBus = eventBus
        eventBus.add(this);
    }
    disconnect() {
        if (!this.eventBus) {
            throw new Error('Node is not connected to any event bus');
        }
        this.eventBus.remove(this.id);
    }
    /**
     * 发送消息到指定节点
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<T extends FastEventBusNodeMessage>(toNodeId: string, message: T): void {
        if (!this.eventBus) {
            throw new Error('Node is not connected to any event bus');
        }
        const toNode = this.eventBus.nodes.get(toNodeId);
        if (!toNode) {
            throw new Error(`Node ${toNodeId} not found`);
        }
        toNode.onMessage(message);
    }

    /**
     * 广播消息到所有其他节点
     * @param message 要广播的消息
     */
    broadcast<T extends FastEventBusNodeMessage>(message: T): void {
        if (!this.eventBus) {
            throw new Error('Node is not connected to any event bus');
        }
        message.from = this.id
        this.eventBus.broadcast(message);
    }

    /**
     * 处理接收到的消息
     * @param message 接收到的消息
     */
    _onMessage<T extends FastEventBusNodeMessage>(message: FastEventBusNodeMessage<T>): void {
        // 如果消息有特定目标且不是当前节点，忽略该消息
        if (message.to && message.to !== this.id) {
            return;
        }

        // 处理订阅的消息（node::event 格式）
        if (message.type) {
            // 原始事件类型
            this.emit(message.type, message);

            // 带源节点的事件类型（node::event）
            const nodeEvent = `${message.from}::${message.type}`;
            this.emit(nodeEvent, message);
        }
    }
    /**
     * 供子类继承重载
     */
    onMessage(message: FastEventBusNodeMessage) {
    }
}