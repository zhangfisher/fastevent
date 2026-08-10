import type { FastEventListenerNode } from "../types";

/**
 * 先序遍历 node 的所有后代节点(不含 node 自身),用于 broadcast 收集后代覆盖监听器。
 *
 * 含通配符 key(* / **)的节点;__listeners 为空的中间节点也会被访问
 * (由调用方按需跳过)。先序:父先于子。
 *
 * @param node - 遍历起点(自身不回调)
 * @param basePath - 起点的完整路径段
 * @param callback - 每个后代节点的回调,接收(完整路径段, 节点)
 */
export function forEachDescendant(
    node: FastEventListenerNode,
    basePath: string[],
    callback: (path: string[], node: FastEventListenerNode) => void,
): void {
    for (const [key, childNode] of Object.entries(node)) {
        if (key.startsWith("__")) continue;
        if (!childNode) continue;
        const childPath = [...basePath, key];
        callback(childPath, childNode as FastEventListenerNode); // 先序:父先于子
        forEachDescendant(childNode as FastEventListenerNode, childPath, callback);
    }
}
