import type { FastEventListenerNode } from "../types";
import { getNodeByPath } from "./getNodeByPath";
import { forEachDescendant } from "./forEachDescendant";

/** broadcast 的后代覆盖目标:节点 + 其完整事件类型(路径字符串) */
export type BroadcastTarget = { node: FastEventListenerNode; type: string };

/**
 * 收集 broadcast 的后代覆盖目标:从 emit 精确路径终点节点出发,
 * 先序遍历其子树(不含终点自身),返回所有后代 [{node, type}]。
 *
 * @param root - 监听器树根节点
 * @param parts - emit 事件路径段数组
 * @param delimiter - 路径分隔符
 * @returns 后代目标数组(先序);精确终点不存在则空数组
 */
export function collectBroadcastTargets(
    root: FastEventListenerNode,
    parts: string[],
    delimiter: string,
): BroadcastTarget[] {
    const exactNode = getNodeByPath(root, parts);
    if (!exactNode) return [];
    const targets: BroadcastTarget[] = [];
    forEachDescendant(exactNode, parts, (path, node) => {
        targets.push({ node, type: path.join(delimiter) });
    });
    return targets;
}
