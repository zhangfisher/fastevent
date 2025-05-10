
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { FastEventBus, FastEventBusMessage, FastEventBusNode } from '../eventbus';


class CustomNode extends FastEventBusNode {
    messages: FastEventBusMessage[] = []
    onMessage(message: any) {
        this.messages.push(message)
        return message.payload
    }
}

describe('FastEventBus', () => {
    let eventbus: FastEventBus;
    let node1: CustomNode;
    let node2: CustomNode;
    let node3: CustomNode;
    let node4: CustomNode;
    let node5: CustomNode;

    beforeEach(() => {
        eventbus = new FastEventBus();
        node1 = new CustomNode({ id: 'node1' });
        node2 = new CustomNode({ id: 'node2' });
        node3 = new CustomNode({ id: 'node3' });
        node4 = new CustomNode({ id: 'node4' });
        node5 = new CustomNode({ id: 'node5' });
        node1.connect(eventbus)
        node2.connect(eventbus)
        node3.connect(eventbus)
        node4.connect(eventbus)
        node5.connect(eventbus)
    });
    describe('节点的加入和离开', () => {
        test("节点的加入事件", () => {
            const nodes: string[] = []
            eventbus.on('$connect/*', (message) => {
                nodes.push(message.type.substring(9))
            })
            expect(nodes).toEqual([
                'node1',
                'node2',
                'node3',
                'node4',
                'node5'
            ])
        })
        test("节点的离开事件", () => {
            const nodes: string[] = []
            eventbus.on('$disconnect/*', (message) => {
                nodes.push(message.type.substring(12))
            })
            node1.disconnect()
            node2.disconnect()
            node3.disconnect()
            node4.disconnect()
            node5.disconnect()
            expect(nodes).toEqual([
                'node1',
                'node2',
                'node3',
                'node4',
                'node5'
            ])
        })

    })
    describe('点对点发送消息', () => {
        test('点对点发送消息', () => {
            node1.send('node2', 1)
            node1.send('node3', 2)
            node1.send('node4', 3)
            node1.send('node5', 3)
            expect(node2.messages.length).toBe(1)
            expect(node2.messages[0].payload).toBe(1)
            expect(node3.messages.length).toBe(1)
            expect(node3.messages[0].payload).toBe(2)
            expect(node4.messages.length).toBe(1)
            expect(node4.messages[0].payload).toBe(3)
            expect(node5.messages.length).toBe(1)
            expect(node5.messages[0].payload).toBe(3)
        });
        test('接收点对点发送消息的返回值', () => {
            const results: any[] = []
            results.push(node1.send('node2', 1))
            results.push(node1.send('node3', 2))
            results.push(node1.send('node4', 3))
            results.push(node1.send('node5', 4))
            expect(results).toEqual([1, 2, 3, 4])
        });
    })

    describe('广播消息', () => {
        test("总线广播消息给所有节点", () => {
            eventbus.broadcast(1)
            expect(node1.messages.length).toBe(1)
            expect(node1.messages[0].payload).toBe(1)
            expect(node2.messages.length).toBe(1)
            expect(node2.messages[0].payload).toBe(1)
            expect(node3.messages.length).toBe(1)
            expect(node3.messages[0].payload).toBe(1)
            expect(node4.messages.length).toBe(1)
            expect(node4.messages[0].payload).toBe(1)
            expect(node5.messages.length).toBe(1)
            expect(node5.messages[0].payload).toBe(1)
        })
        test("总线广播保留消息给所有节点，后续节点也可以接收到广播消息", () => {
            eventbus.broadcast(1, { retain: true })
            const results: FastEventBusMessage[] = []
            const lastNode1 = new FastEventBusNode()
            lastNode1.onMessage = vi.fn().mockImplementation((message) => {
                results.push(message)
            })
            const lastNode2 = new FastEventBusNode()
            lastNode2.onMessage = vi.fn().mockImplementation((message) => {
                results.push(message)
            })
            lastNode1.connect(eventbus)
            lastNode2.connect(eventbus)
            expect(results.length).toBe(2)
            expect(results[0].type).toBe(`@/data`)
            expect(results[0].payload).toBe(1)

            expect(results[1].type).toBe(`@/data`)
            expect(results[1].payload).toBe(1)
        })

        test('接收总线广播接收者的返回值', () => {
            expect(eventbus.broadcast(1)).toEqual([1, 1, 1, 1, 1])
        });

        test("广播消息指定类型的消息", () => {
            eventbus.broadcast({ type: "notify", payload: 1 })
            expect(node1.messages.length).toBe(1)
            expect(node1.messages[0].payload).toBe(1)
            expect(node2.messages.length).toBe(1)
            expect(node2.messages[0].payload).toBe(1)
            expect(node3.messages.length).toBe(1)
            expect(node3.messages[0].payload).toBe(1)
            expect(node4.messages.length).toBe(1)
            expect(node4.messages[0].payload).toBe(1)
            expect(node5.messages.length).toBe(1)
            expect(node5.messages[0].payload).toBe(1)
        })

        test("在节点中发起广播消息给所有节点", () => {
            node1.broadcast(1)
            expect(node1.messages.length).toBe(1)
            expect(node1.messages[0].payload).toBe(1)
            expect(node1.messages[0].from).toBe('node1')

            expect(node2.messages.length).toBe(1)
            expect(node2.messages[0].payload).toBe(1)
            expect(node2.messages[0].from).toBe('node1')

            expect(node3.messages.length).toBe(1)
            expect(node3.messages[0].payload).toBe(1)
            expect(node3.messages[0].from).toBe('node1')

            expect(node4.messages.length).toBe(1)
            expect(node4.messages[0].payload).toBe(1)
            expect(node4.messages[0].from).toBe('node1')

            expect(node5.messages.length).toBe(1)
            expect(node5.messages[0].payload).toBe(1)
            expect(node5.messages[0].from).toBe('node1')
        })
        test("总线广播指定事件保留消息给所有节点，后续节点也可以接收到广播消息", () => {
            eventbus.broadcast({
                type: "order/new",
                payload: 1
            }, { retain: true })
            const results: FastEventBusMessage[] = []
            const lastNode1 = new FastEventBusNode()
            lastNode1.onMessage = vi.fn().mockImplementation((message) => {
                results.push(message)
            })
            const lastNode2 = new FastEventBusNode()
            lastNode2.onMessage = vi.fn().mockImplementation((message) => {
                results.push(message)
            })
            lastNode1.connect(eventbus)
            lastNode2.connect(eventbus)

            expect(results.length).toBe(2)
            expect(results[0].type).toBe(`@/order/new`)
            expect(results[0].payload).toBe(1)

            expect(results[1].type).toBe(`@/order/new`)
            expect(results[1].payload).toBe(1)
        })
        test("接收所有retain总线广播指定事件", () => {
            eventbus.broadcast({
                type: "order/new",
                payload: 1
            }, { retain: true })
            eventbus.broadcast({
                type: "order/cancel",
                payload: 2
            }, { retain: true })
            eventbus.broadcast({
                type: "order/submit",
                payload: 3
            }, { retain: true })
            eventbus.broadcast({
                type: "order/pay",
                payload: 4
            }, { retain: true })

            const results: FastEventBusMessage[] = []
            const lastNode = new FastEventBusNode()
            lastNode.onMessage = vi.fn().mockImplementation((message) => {
                results.push(message)
            })
            lastNode.connect(eventbus)

            expect(results.length).toBe(4)
            expect(results.map(msg => msg.type)).toEqual([
                `@/order/new`,
                `@/order/cancel`,
                `@/order/submit`,
                `@/order/pay`,
            ])
            expect(results.map(msg => msg.payload)).toEqual([
                1,
                2,
                3,
                4,
            ])

        })
    })
    describe('触发事件', () => {

        test("在其他节点触发事件", () => {
            const node = new FastEventBusNode({ id: 'node' })
            node.connect(eventbus)
            const anyListener = vi.fn()
            node.onAny(anyListener)
            const messages: FastEventBusMessage[] = []
            const otherListener = vi.fn().mockImplementation((message) => {
                messages.push(message)
                return 1
            })
            const otherNode = new FastEventBusNode({ id: 'other' })
            otherNode.on('a/b/c', otherListener)
            otherNode.connect(eventbus)
            // 在其他节点触发事件
            const results = node.emit('other::a/b/c', 1)
            expect(anyListener).not.toHaveBeenCalled()
            expect(otherListener).toHaveBeenCalled()
            expect(messages.length).toBe(1)
            expect(messages[0].payload).toBe(1)
            expect(messages[0].from).toBe('node')
            expect(results[0]).toBe(1)
        })
    })
    describe('监听其他节点的事件', () => {
        test("监听其他节点事件", () => {
            const messages: FastEventBusMessage[] = []
            node1.on("node2::a/b/c", (message) => {
                messages.push(message)
            })
            node2.emit("a/b/c", 1)
            expect(messages.length).toBe(1)
            expect(messages[0].type).toBe('a/b/c')
            expect(messages[0].payload).toBe(1)
        })

        test("监听其他节点事件并注销", () => {
            const messages: FastEventBusMessage[] = []
            const subscriber = node1.on("node2::a/b/c", (message) => {
                messages.push(message)
            })
            node2.emit("a/b/c", 1)
            subscriber.off()
            node2.emit("a/b/c", 2)
            node2.emit("a/b/c", 3)
            expect(messages.length).toBe(1)
            expect(messages[0].type).toBe('a/b/c')
            expect(messages[0].payload).toBe(1)
        })
        test("节点延迟连接时监听其他节点事件并注销", () => {
            const messages: FastEventBusMessage[] = []
            const subscriber = node1.on("xnode::a/b/c", (message) => {
                messages.push(message)
            })
            const xNode = new FastEventBusNode({ id: 'xnode' })
            xNode.connect(eventbus)
            xNode.emit("a/b/c", 1)
            subscriber.off()
            xNode.emit("a/b/c", 2)
            xNode.emit("a/b/c", 3)
            expect(messages.length).toBe(1)
            expect(messages[0].type).toBe('a/b/c')
            expect(messages[0].payload).toBe(1)
        })
    })
});