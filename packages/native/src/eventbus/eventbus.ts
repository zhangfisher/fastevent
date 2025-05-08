/**
 * 
 * const eventbus = new FastEventBus()
 * 
 * const node1 = new FastEventBusNode({id:"node1",...})
 * const node2 = new FastEventBusNode({id:"node2",...})
 * const node3 = new FastEventBusNode({id:"node3",...})
 * 
 * - 将节点添加到FastEventBus中
 * eventbus.add(node1)
 * eventbus.add(node2)
 * eventbus.add(node3) 
 * 或者
 * node1.join(eventbus)
 * node2.join(eventbus)
 * node3.join(eventbus)
 * 
 * - 每个节点均有唯一的节点名称，用于区分不同的节点
 * - 每个节点是一个独立的FastEvent实例
 * - 每个节点的配置选项与FastEvent相同
 * - 节点之间相互独立，互不影响
 * - FastEventBus负载节点之间的通讯
 * - 所有节点均可以在onMessage中接收到其订阅或点对点或广播的消息  
 * 
 * - 可以广播消息给所有节点
 *   
 *   eventbus.broadcast(message)
 *   node1.broadcast(message)
 * 
 * - 可以在节点之间进行点对点发送消息
 * 
 *    eventbus.send(node1.id, message)
 *    node1.send(node2.id, message)
 * 
 * 
 * - 节点消息接收到的消息是FastEventBusNodeMessage,增加了from代表是消息来自哪里
 * - 节点如果要订阅其他节点的消息，需要在事件类型名称加::
 *    node1.on("node2::test",listener,{...})代表订阅node2的test事件
 * - 节点可以在全局触发事件
 *    node1.emit("::test")      在全局(即Eventbus)触发事件
 *    node2.on("::test",listener,{...})
 *     
 */

import { FastEvent } from "../event";
import { FastEventListenerArgs } from '../types';
import { BroadcastEvent, NamespaceDelimiter } from "./consts";
import type { FastEventBusNode } from "./node";
import { FastEventBusEvents, FastEventBusMessage, FastEventBusOptions } from "./types";


export class FastEventBus<
    Events extends Record<string, any> = FastEventBusEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never
> extends FastEvent<Events & FastEventBusEvents, Meta, Context> {
    nodes: Map<string, FastEventBusNode<any, any, any>>;

    constructor(options?: FastEventBusOptions<Meta, Context>) {
        super(options);
        this.nodes = new Map();
    }

    /**
     * 添加节点到事件总线
     * @param node 要添加的节点
     */
    add(node: FastEventBusNode<any, any, any, any>): void {
        if (this.nodes.has(node.id)) {
            throw new Error(`Node with id ${node.id} already exists`);
        }
        this.nodes.set(node.id, node);
        this.emit("node:connect", node.id as any)
    }

    /**
     * 从事件总线移除节点
     * @param nodeId 要移除的节点ID
     */
    remove(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.eventbus = undefined;
            this.nodes.delete(nodeId);
            this.emit("node:disconnect", node.id as any)
        }
    }

    /**
     * 广播消息到所有节点
     * @param message 要广播的消息
     */
    broadcast(message: FastEventBusMessage, args?: FastEventListenerArgs) {
        return this.emit(BroadcastEvent, message as any, args as any)
    }

    /**
     * 发送消息到指定节点
     * 
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<R = any[]>(message: FastEventBusMessage, args?: FastEventListenerArgs): R[]
    send<R = any[]>(toNodeId: string, message: FastEventBusMessage, args?: FastEventListenerArgs): R[]
    send() {
        let toNodeId = typeof (arguments[0]) === 'string' ? arguments[0] : undefined;
        const message = typeof (arguments[1]) === 'object' ? arguments[1] : arguments[0];
        const args = typeof (arguments[0]) === 'string' ? arguments[2] : arguments[1];

        const [nodeId, type] = message.type.includes(NamespaceDelimiter) ? message.type.split(NamespaceDelimiter) : [toNodeId, message.type];
        message.type = type

        const targetNode = this.nodes.get(nodeId);
        if (!targetNode) {
            throw new Error(`Node ${toNodeId} not found`);
        }
        message.to = nodeId
        return targetNode.emit(message, args)
    }

}

// const bus = new FastEventBus<{ add: number }>()

// bus.on('node:connect')
