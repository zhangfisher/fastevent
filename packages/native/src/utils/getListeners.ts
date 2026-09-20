import { FastEvent } from "../event";
import type { FastLiteEvent } from "../liteEvent";
import { FastEventListenerMeta, FastEventListenerNode } from "../types";

/**
 * 获取指定类型的所有事件监听器
 */
export function getListeners(
    emitter: FastEvent | FastLiteEvent,
    type: string,
): FastEventListenerMeta[] {
    const fastEventInstanct = emitter as any;
    const nodes: FastEventListenerNode[] = [];
    const parts = type.split(fastEventInstanct._delimiter);
    fastEventInstanct._traverseToPath(emitter.listeners, parts, (node: any) => {
        nodes.push(node);
    });
    const listeners: any[] = [];
    nodes.map((node) => {
        listeners.push(...node.__listeners);
    });
    return listeners;
}
