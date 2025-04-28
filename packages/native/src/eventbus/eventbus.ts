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
import { FastEventMessage } from '../types';
import { FastEventBusNode } from "./node";
import { FastEventBusEvents, FastEventBusNodeMessage, FastEventBusOptions } from "./types";


export class FastEventBus extends FastEvent<FastEventBusEvents> {
    nodes: Map<string, FastEventBusNode>;

    constructor(options?: FastEventBusOptions) {
        super(options);
        this.nodes = new Map();
    }

    /**
     * 添加节点到事件总线
     * @param node 要添加的节点
     */
    add(node: FastEventBusNode): void {
        if (!node.id) {
            throw new Error('Node must have an id');
        }
        if (this.nodes.has(node.id)) {
            throw new Error(`Node with id ${node.id} already exists`);
        }
        this.nodes.set(node.id, node);
        node.eventBus = this;
        this.emit("node:connect", node.id)
    }

    /**
     * 从事件总线移除节点
     * @param nodeId 要移除的节点ID
     */
    remove(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (node) {
            node.eventBus = undefined;
            this.nodes.delete(nodeId);
            this.emit("node:disconnect", node.id)
        }
    }

    /**
     * 广播消息到所有节点
     * @param message 要广播的消息
     */
    broadcast<T extends FastEventBusNodeMessage>(message: T): void {
        const busMessage: FastEventBusNodeMessage<T> = {
            ...message,
            from: ''
        };
        this.nodes.forEach(node => {
            node._onMessage(busMessage);
        });
    }

    /**
     * 发送消息到指定节点
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<T extends FastEventMessage>(toNodeId: string, message: T): void {
        const targetNode = this.nodes.get(toNodeId);
        if (!targetNode) {
            throw new Error(`Node ${toNodeId} not found`);
        }
        const busMessage: FastEventBusNodeMessage<T> = {
            ...message,
            from: '',
            to: toNodeId
        };
        targetNode.onMessage(busMessage);
    }

}