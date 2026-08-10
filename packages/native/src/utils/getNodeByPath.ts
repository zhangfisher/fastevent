import type { FastEventListenerNode } from "../types";

/**
 * 沿精确路径段(不跟通配符)从根节点走到终点节点。
 *
 * 用于 broadcast:确定 emit 精确路径的终点节点,作为后代遍历的起点。
 * 与 _traverseToPath 不同——后者沿 parts 匹配(含通配符),本函数只走精确 key。
 *
 * @param root - 监听器树根节点
 * @param parts - 事件路径段数组
 * @returns 终点节点;任一段不存在则 undefined
 */
export function getNodeByPath(
    root: FastEventListenerNode,
    parts: string[],
): FastEventListenerNode | undefined {
    let node: FastEventListenerNode | undefined = root;
    for (const part of parts) {
        if (node && part in node) {
            node = node[part] as FastEventListenerNode;
        } else {
            return undefined;
        }
    }
    return node;
}
