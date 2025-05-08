
import { beforeEach, describe, expect, test } from 'vitest';
import { FastEventBus, FastEventBusNode } from '../eventbus';

describe('FastEventBus', () => {
    let eventBus: FastEventBus;
    let node1: FastEventBusNode;
    let node2: FastEventBusNode;
    let node3: FastEventBusNode;
    let node4: FastEventBusNode;
    let node5: FastEventBusNode;

    beforeEach(() => {
        eventBus = new FastEventBus();
        node1 = new FastEventBusNode({ id: 'node1' });
        node2 = new FastEventBusNode({ id: 'node2' });
        node3 = new FastEventBusNode({ id: 'node3' });
        node4 = new FastEventBusNode({ id: 'node4' });
        node5 = new FastEventBusNode({ id: 'node5' });
    });

    test('should add nodes to event bus', () => {
        eventBus.add(node1);
        eventBus.add(node2);



        expect(node1.eventbus).toBe(eventBus);
        expect(node2.eventbus).toBe(eventBus);

        node5.on("node1::1")
    });

    test('should allow nodes to join event bus', () => {
        node1.connect(eventBus);
        node2.connect(eventBus);
        expect(node1.eventbus).toBe(eventBus);
        expect(node2.eventbus).toBe(eventBus);
    });

    test('should not allow duplicate node ids', () => {
        eventBus.add(node1);
        const duplicateNode = new FastEventBusNode({ id: 'node1' });
        expect(() => eventBus.add(duplicateNode)).toThrow();
    });

    test('should broadcast message to all nodes', () => {
        const messages: any[] = [];
        eventBus.add(node1);
        eventBus.add(node2);
        eventBus.add(node3);

        node1.on('test', (msg) => messages.push({ node: 'node1', msg }));
        node2.on('test', (msg) => messages.push({ node: 'node2', msg }));
        node3.on('test', (msg) => messages.push({ node: 'node3', msg }));

        eventBus.broadcast({ type: 'test', payload: 'hello' });

        expect(messages).toHaveLength(3);
        expect(messages.map(m => m.node)).toEqual(['node1', 'node2', 'node3']);
        expect(messages.every(m => m.msg.from === 'bus')).toBe(true);
    });

    test('should send point-to-point message', () => {
        const messages: any[] = [];
        eventBus.add(node1);
        eventBus.add(node2);

        node1.on('test', (msg) => messages.push({ node: 'node1', msg }));
        node2.on('test', (msg) => messages.push({ node: 'node2', msg }));

        node1.send('node2', { type: 'test', payload: 'hello' });

        expect(messages).toHaveLength(1);
        expect(messages[0].node).toBe('node2');
        expect(messages[0].msg.from).toBe('node1');
        expect(messages[0].msg.to).toBe('node2');
    });

    test('should support node-specific event subscription', () => {
        const messages: any[] = [];
        eventBus.add(node1);
        eventBus.add(node2);

        // 订阅特定节点的事件
        node1.on('node2::test', (msg) => messages.push({ node: 'node1', msg }));

        // 发送消息
        node2.broadcast({ type: 'test', data: 'hello' });

        expect(messages).toHaveLength(1);
        expect(messages[0].msg.from).toBe('node2');
        expect(messages[0].msg.data).toBe('hello');
    });

    test('should remove nodes from event bus', () => {
        eventBus.add(node1);
        eventBus.add(node2);

        eventBus.remove(node1.id);
        expect(node1.eventbus).toBeUndefined();

        // 尝试向已移除的节点发送消息
        expect(() => node2.send(node1.id, { type: 'test' })).toThrow();
    });

    test('should handle broadcast from node', () => {
        const messages: any[] = [];
        eventBus.add(node1);
        eventBus.add(node2);
        eventBus.add(node3);

        node2.on('test', (msg) => messages.push({ node: 'node2', msg }));
        node3.on('test', (msg) => messages.push({ node: 'node3', msg }));

        node1.broadcast({ type: 'test', data: 'hello' });

        expect(messages).toHaveLength(2);
        expect(messages.map(m => m.node)).toEqual(['node2', 'node3']);
        expect(messages.every(m => m.msg.from === 'node1')).toBe(true);
    });
});