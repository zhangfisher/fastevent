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

import { FastEventDirectives } from "../consts";
import { FastEvent } from "../event";
import { Expand, FastEventListenerArgs, FastEventMessage } from '../types';
import { NodeDataEvent } from "./consts";
import type { FastEventBusNode } from "./node";
import { FastEventBusEvents, FastEventBusMessage, FastEventBusOptions } from "./types";
import { parseBroadcaseArgs } from "./utils";


export class FastEventBus<
    Events extends Record<string, any> = FastEventBusEvents,
    Meta extends Record<string, any> = Record<string, any>,
    Context = never,
    AllEvents extends Record<string, any> = Exclude<Expand<Events & FastEventBusEvents>, number | symbol>,
    Types extends keyof AllEvents = Expand<Exclude<keyof (AllEvents), number | symbol>>
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
    add(...nodes: FastEventBusNode<any, any, any, any>[]): void {
        nodes.forEach(node => {
            if (this.nodes.has(node.id)) {
                throw new Error(`Node with id ${node.id} already exists`);
            }
            node.options.delimiter = this.options.delimiter
            node.options.debug = this.options.debug
            node.options.ignoreErrors = this.options.ignoreErrors
            this.nodes.set(node.id, node);
            this.emit(`$disconnect${this.options.delimiter}${node.id}`, FastEventDirectives.clearRetain)
            this.emit(`$connect${this.options.delimiter}${node.id}`, node.id as any, true)
        })
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
            this.emit(`$connect${this.options.delimiter}${node.id}`, FastEventDirectives.clearRetain)
            this.emit(`$disconnect${this.options.delimiter}${node.id}`, node.id as any, true)
        }
    }

    /**
     * 广播消息到所有节点
     * 
     * broadcast(1)  // 默认广播主题data
     * broadcast({
     *    type: 'connect',
     *    payload: 100
     * })     * 
     * 
     * @param message 要广播的消息
     */
    broadcast<R = any, T extends Types = Types>(message: FastEventBusMessage<{ [K in T]: AllEvents[T] }, Meta>, args?: FastEventListenerArgs): R[]
    broadcast<R = any, T extends string = string>(message: FastEventBusMessage<{ [K in T]: K extends Types ? AllEvents[K] : any }, Meta>, args?: FastEventListenerArgs): R[]
    broadcast<R = any, T extends string = string>(type: T, payload?: T extends Types ? AllEvents[Types] : any, options?: FastEventListenerArgs<Meta>): R[]
    broadcast<R = any, T extends Types = Types>(type: T, payload: AllEvents[T], args?: FastEventListenerArgs): R[]
    broadcast<R = any>(): R[] {
        const [message, args] = parseBroadcaseArgs(arguments, this.options.delimiter)
        return this.emit(message, args as any)
    }

    /**
     * 发送消息到指定节点
     * 
     * 点对点消息的事件名称为data
     * 
     * @param toNodeId 目标节点ID
     * @param message 要发送的消息
     */
    send<R = any>(message: FastEventBusMessage, args?: FastEventListenerArgs): R[] {
        message.type = `${message.to}${this.options.delimiter}${NodeDataEvent}`
        return this.emit(message as FastEventMessage, args as any)[0]
    }

} 