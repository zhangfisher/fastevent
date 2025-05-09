
import { beforeEach, describe, expect, test } from 'vitest';
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

    })

});