// oxlint-disable typescript/unbound-method
// packages/viewer/src/listenerViewer/index.ts
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./styles";
import type { FastEvent } from "fastevent";
import type { FastEventListenerMeta } from "fastevent";
import "./listenerCard";

interface TreeNode {
    key: string;
    path: string[];
    listeners: FastEventListenerMeta[];
    children: TreeNode[];
    depth: number;
}

/**
 * FastEventListeners 组件 - 显示 FastEvent 实例的监听器树
 */
@customElement("fastevent-listeners")
export class FastEventListeners extends LitElement {
    static styles = styles;

    @property({ type: Object })
    emitter?: FastEvent;

    @property({ type: Boolean, reflect: true })
    dark = false;

    @state()
    private _treeData: TreeNode[] = [];

    @state()
    private _selectedPath: string[] = [];

    @state()
    private _listeners: FastEventListenerMeta[] = [];

    @state()
    private _expandedNodes = new Set<string>();

    private _leftWidth = "33.33%";
    private _isResizing = false;
    private _resizeStartX = 0;
    private _resizeStartWidth = 0;

    /**
     * 从 emitter.listeners 构建树形数据
     */
    private _buildTreeData(): TreeNode[] {
        if (!this.emitter?.listeners) return [];

        const build = (node: any, path: string[], depth: number): TreeNode[] => {
            const children: TreeNode[] = [];

            for (const key in node) {
                if (key === "__listeners") continue;

                const childPath = [...path, key];
                const child = node[key] as any;

                children.push({
                    key,
                    path: childPath,
                    listeners: child.__listeners || [],
                    children: build(child, childPath, depth + 1),
                    depth,
                });
            }

            return children;
        };

        return build(this.emitter.listeners, [], 0);
    }

    /**
     * 初始化展开状态
     */
    private _initializeExpandedNodes(treeData: TreeNode[]): void {
        this._expandedNodes = new Set();

        const collectPaths = (nodes: TreeNode[]) => {
            for (const node of nodes) {
                this._expandedNodes.add(node.path.join("/"));
                if (node.children.length > 0) {
                    collectPaths(node.children);
                }
            }
        };

        collectPaths(treeData);
    }

    /**
     * 查找第一个有监听器的节点
     */
    private _findFirstNodeWithListeners(treeData: TreeNode[]): TreeNode | null {
        const find = (nodes: TreeNode[]): TreeNode | null => {
            for (const node of nodes) {
                if (node.listeners.length > 0) {
                    return node;
                }
                const found = find(node.children);
                if (found) return found;
            }
            return null;
        };

        return find(treeData);
    }

    /**
     * 刷新所有数据
     */
    private _refreshData(): void {
        const treeData = this._buildTreeData();
        this._treeData = treeData;

        // 如果是首次加载数据，初始化展开状态和选中状态
        if (treeData.length > 0 && this._expandedNodes.size === 0) {
            this._initializeExpandedNodes(treeData);

            const firstNode = this._findFirstNodeWithListeners(treeData);
            if (firstNode) {
                this._selectedPath = firstNode.path;
                this._listeners = firstNode.listeners;
            }
        } else {
            // 如果当前选中的路径仍有监听器，更新监听器列表
            if (this._selectedPath.length > 0) {
                const node = this._findNodeByPath(treeData, this._selectedPath);
                this._listeners = node?.listeners || [];
            }
        }
    }

    /**
     * 根据路径查找节点
     */
    private _findNodeByPath(treeData: TreeNode[], targetPath: string[]): TreeNode | null {
        const find = (nodes: TreeNode[]): TreeNode | null => {
            for (const node of nodes) {
                if (JSON.stringify(node.path) === JSON.stringify(targetPath)) {
                    return node;
                }
                const found = find(node.children);
                if (found) return found;
            }
            return null;
        };

        return find(treeData);
    }

    /**
     * 处理节点选择
     */
    private _handleNodeSelect(path: string[]): void {
        this._selectedPath = path;

        const node = this._findNodeByPath(this._treeData, path);
        this._listeners = node?.listeners || [];

        this.requestUpdate();
    }

    /**
     * 处理节点展开/收起
     */
    private _handleNodeToggle(path: string[]): void {
        const pathKey = path.join("/");

        if (this._expandedNodes.has(pathKey)) {
            this._expandedNodes.delete(pathKey);
        } else {
            this._expandedNodes.add(pathKey);
        }

        this.requestUpdate();
    }

    /**
     * 手动刷新
     */
    private _handleRefresh(): void {
        this._refreshData();
        this.requestUpdate();
    }

    private _handleResizeStart(event: MouseEvent): void {
        this._isResizing = true;
        this._resizeStartX = event.clientX;
        this._resizeStartWidth =
            (this.shadowRoot?.querySelector(".tree-panel") as HTMLElement)?.offsetWidth || 0;

        document.addEventListener("mousemove", this._handleResizeMove);
        document.addEventListener("mouseup", this._handleResizeEnd);

        const resizer = this.shadowRoot?.querySelector(".resizer") as HTMLElement;
        resizer?.classList.add("dragging");
    }

    private _handleResizeMove = (event: MouseEvent): void => {
        if (!this._isResizing) return;

        const offsetX = event.clientX - this._resizeStartX;
        const containerWidth =
            (this.shadowRoot?.querySelector(".main-container") as HTMLElement)?.offsetWidth || 0;
        const newWidthPercent = ((this._resizeStartWidth + offsetX) / containerWidth) * 100;
        const clampedWidth = Math.max(20, Math.min(80, newWidthPercent));

        this._leftWidth = `${clampedWidth}%`;
        this.style.setProperty("--fe-left-width", this._leftWidth);
    };

    private _handleResizeEnd = (): void => {
        this._isResizing = false;
        document.removeEventListener("mousemove", this._handleResizeMove);
        document.removeEventListener("mouseup", this._handleResizeEnd);

        const resizer = this.shadowRoot?.querySelector(".resizer") as HTMLElement;
        resizer?.classList.remove("dragging");
    };

    private _handleKeyDown(event: KeyboardEvent, node: TreeNode): void {
        const pathKey = node.path.join("/");

        switch (event.key) {
            case "Enter":
            case " ":
                event.preventDefault();
                this._handleNodeSelect(node.path);
                break;
            case "ArrowRight":
                event.preventDefault();
                if (!this._expandedNodes.has(pathKey)) {
                    this._handleNodeToggle(node.path);
                }
                break;
            case "ArrowLeft":
                event.preventDefault();
                if (this._expandedNodes.has(pathKey)) {
                    this._handleNodeToggle(node.path);
                }
                break;
        }
    }

    private renderTreeNode(node: TreeNode): ReturnType<typeof html> {
        const pathKey = node.path.join("/");
        const isExpanded = this._expandedNodes.has(pathKey);
        const isSelected = JSON.stringify(this._selectedPath) === JSON.stringify(node.path);
        const hasChildren = node.children.length > 0;

        return html`
            <div>
                <div
                    class="tree-node ${isSelected ? "selected" : ""}"
                    style="padding-left: ${node.depth * 16 + 8}px"
                    role="treeitem"
                    aria-expanded="${hasChildren ? isExpanded : false}"
                    aria-selected="${isSelected}"
                    tabindex="${isSelected ? "0" : "-1"}"
                    @keydown="${(e: KeyboardEvent) => this._handleKeyDown(e, node)}"
                >
                    <span
                        class="tree-node-toggle ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}"
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
                        ${
                            node.listeners.length > 0
                                ? html`
                            <span class="tree-node-badge">${node.listeners.length}</span>
                        `
                                : ""
                        }
                    </span>
                </div>
                ${
                    hasChildren && isExpanded
                        ? html`
                    <div class="tree-children">
                        ${node.children.map((child) => this.renderTreeNode(child))}
                    </div>
                `
                        : ""
                }
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
            <div>
                ${this._treeData.map((node) => this.renderTreeNode(node))}
            </div>
        `;
    }

    private renderListener(listener: FastEventListenerMeta, type: string): ReturnType<typeof html> {
        return html`<fastevent-listener-card .listener="${listener}" .emitter="${this.emitter}" .type="${type}"></fastevent-listener-card>`;
    }

    private renderListeners(): ReturnType<typeof html> {
        if (this._listeners.length === 0) {
            return html`
                <div class="empty-state">
                    <span class="icon listeners" style="--icon-size: 3em"></span>
                    <p>该节点暂无监听器</p>
                </div>
            `;
        }

        // 获取当前选中节点的事件类型
        const type = this._selectedPath.join("/");

        return html`
            <div>
                ${this._listeners.map((listener) => this.renderListener(listener, type))}
            </div>
        `;
    }

    override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
        super.willUpdate(changedProperties);

        // 当 emitter 变化时，加载数据
        if (changedProperties.has("emitter")) {
            if (this.emitter) {
                this._refreshData();
            } else {
                // 清空数据
                this._treeData = [];
                this._listeners = [];
                this._selectedPath = [];
                this._expandedNodes = new Set();
            }
        }
    }

    override connectedCallback(): void {
        super.connectedCallback();

        // 组件连接时加载初始数据
        if (this.emitter) {
            this._refreshData();
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        // 清理 resize 事件监听
        if (this._isResizing) {
            document.removeEventListener("mousemove", this._handleResizeMove);
            document.removeEventListener("mouseup", this._handleResizeEnd);
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
                <div class="tree-panel" role="tree">
                    ${this.renderTree()}
                </div>
                <div class="resizer" @mousedown="${this._handleResizeStart}"></div>
                <div class="listeners-panel">
                    ${this.renderListeners()}
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
