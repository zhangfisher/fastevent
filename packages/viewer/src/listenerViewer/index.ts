// packages/viewer/src/listenerViewer/index.ts
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./styles";
import type { FastEvent } from "fastevent";
import type { FastEventListenerMeta } from "fastevent";

interface TreeNode {
    key: string;
    path: string[];
    listeners: FastEventListenerMeta[];
    listenerCount: number;
    children: TreeNode[];
    depth: number;
}

@customElement("fastevent-listeners")
export class FastEventListeners extends LitElement {
    static styles = styles;

    @property({ type: Object })
    emitter?: FastEvent;

    @property({ type: Boolean, reflect: true })
    dark = false;

    @state()
    private _selectedPath: string[] = [];

    @state()
    private _treeData: TreeNode[] = [];

    @state()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _listeners: FastEventListenerMeta[] = [];

    @state()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _leftWidth = "33.33%";

    @state()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private _refreshing = false;

    @state()
    private _expandedNodes = new Set<string>();

    private _buildTreeData(): TreeNode[] {
        if (!this.emitter?.listeners) return [];

        const build = (node: any, path: string[], depth: number): TreeNode[] => {
            const children: TreeNode[] = [];

            for (const key in node) {
                if (key === '__listeners') continue;

                const childPath = [...path, key];
                const child = node[key] as any;

                children.push({
                    key,
                    path: childPath,
                    listeners: child.__listeners || [],
                    listenerCount: child.__listeners?.length || 0,
                    children: build(child, childPath, depth + 1),
                    depth
                });
            }

            return children;
        };

        return build(this.emitter.listeners, [], 0);
    }

    private _initializeExpandedNodes(): void {
        this._expandedNodes = new Set();

        const collectPaths = (nodes: TreeNode[]) => {
            for (const node of nodes) {
                this._expandedNodes.add(node.path.join('/'));
                if (node.children.length > 0) {
                    collectPaths(node.children);
                }
            }
        };

        collectPaths(this._treeData);
    }

    private _findFirstNodeWithListeners(): TreeNode | null {
        const find = (nodes: TreeNode[]): TreeNode | null => {
            for (const node of nodes) {
                if (node.listenerCount > 0) {
                    return node;
                }
                const found = find(node.children);
                if (found) return found;
            }
            return null;
        };

        return find(this._treeData);
    }

    override updated(): void {
        // 当树数据变化时初始化展开状态和选中状态
        if (this._treeData.length > 0 && this._expandedNodes.size === 0) {
            this._initializeExpandedNodes();

            const firstNode = this._findFirstNodeWithListeners();
            if (firstNode) {
                this._selectedPath = firstNode.path;
                this._listeners = firstNode.listeners;
            }
        }
    }

    private _handleNodeSelect(path: string[]): void {
        this._selectedPath = path;

        const findNode = (nodes: TreeNode[], targetPath: string[]): TreeNode | null => {
            for (const node of nodes) {
                if (JSON.stringify(node.path) === JSON.stringify(targetPath)) {
                    return node;
                }
                const found = findNode(node.children, targetPath);
                if (found) return found;
            }
            return null;
        };

        const node = findNode(this._treeData, path);
        this._listeners = node?.listeners || [];
        this.requestUpdate();
    }

    private _handleNodeToggle(path: string[]): void {
        const pathKey = path.join('/');
        if (this._expandedNodes.has(pathKey)) {
            this._expandedNodes.delete(pathKey);
        } else {
            this._expandedNodes.add(pathKey);
        }
        this.requestUpdate();
    }

    private _handleRefresh(): void {
        this._treeData = this._buildTreeData();
        this._expandedNodes.clear();
        this._initializeExpandedNodes();

        const firstNode = this._findFirstNodeWithListeners();
        if (firstNode) {
            this._selectedPath = firstNode.path;
            this._listeners = firstNode.listeners;
        } else {
            this._selectedPath = [];
            this._listeners = [];
        }

        this.requestUpdate();
    }

    private renderTreeNode(node: TreeNode): ReturnType<typeof html> {
        const pathKey = node.path.join('/');
        const isExpanded = this._expandedNodes.has(pathKey);
        const isSelected = JSON.stringify(this._selectedPath) === JSON.stringify(node.path);
        const hasChildren = node.children.length > 0;

        return html`
            <div>
                <div
                    class="tree-node ${isSelected ? 'selected' : ''}"
                    style="padding-left: ${node.depth * 16 + 8}px"
                >
                    <span
                        class="tree-node-toggle ${isExpanded ? 'expanded' : ''} ${hasChildren ? '' : 'hidden'}"
                        @click="${(e: Event) => {
                            e.stopPropagation();
                            this._handleNodeToggle(node.path);
                        }}"
                    >
                        <span class="icon arrow"></span>
                    </span>
                    <span class="tree-node-content" @click="${() => this._handleNodeSelect(node.path)}">
                        <span class="icon listeners"></span>
                        <span class="tree-node-label">${node.key}</span>
                        ${node.listenerCount > 0 ? html`
                            <span class="tree-node-badge">${node.listenerCount}</span>
                        ` : ''}
                    </span>
                </div>
                ${hasChildren && isExpanded ? html`
                    <div class="tree-children">
                        ${node.children.map(child => this.renderTreeNode(child))}
                    </div>
                ` : ''}
            </div>
        `;
    }

    private renderTree(): ReturnType<typeof html> {
        if (this._treeData.length === 0) {
            return html`
                <div class="empty-state">
                    <span class="icon listeners"></span>
                    <p>暂无注册的监听器</p>
                </div>
            `;
        }

        return html`
            <div role="tree">
                ${this._treeData.map(node => this.renderTreeNode(node))}
            </div>
        `;
    }

    override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('emitter')) {
            this._treeData = this._buildTreeData();
        }
    }

    override render() {
        return html`
            <div class="toolbar">
                <span class="toolbar-title">已注册监听器</span>
                <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
                    <span class="icon refresh"></span>
                </button>
            </div>
            <div class="main-container">
                <div class="tree-panel">
                    ${this.renderTree()}
                </div>
                <div class="resizer"></div>
                <div class="listeners-panel">
                    <p>监听器列表（待实现）</p>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listeners": FastEventListeners;
    }
}
