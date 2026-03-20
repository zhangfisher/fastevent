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
    private _listeners: FastEventListenerMeta[] = [];

    @state()
    private _expandedNodes = new Set<string>();

    @state()
    private _leftWidth = '33.33%';

    private _isResizing = false;
    private _resizeStartX = 0;
    private _resizeStartWidth = 0;

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

    private _handleResizeStart(event: MouseEvent): void {
        this._isResizing = true;
        this._resizeStartX = event.clientX;
        this._resizeStartWidth = (this.shadowRoot?.querySelector('.tree-panel') as HTMLElement)?.offsetWidth || 0;

        document.addEventListener('mousemove', this._handleResizeMove);
        document.addEventListener('mouseup', this._handleResizeEnd);

        const resizer = this.shadowRoot?.querySelector('.resizer') as HTMLElement;
        resizer?.classList.add('dragging');
    }

    private _handleResizeMove = (event: MouseEvent): void => {
        if (!this._isResizing) return;

        const offsetX = event.clientX - this._resizeStartX;
        const containerWidth = (this.shadowRoot?.querySelector('.main-container') as HTMLElement)?.offsetWidth || 0;
        const newWidthPercent = (this._resizeStartWidth + offsetX) / containerWidth * 100;
        const clampedWidth = Math.max(20, Math.min(80, newWidthPercent));

        this._leftWidth = `${clampedWidth}%`;
        this.style.setProperty('--fe-left-width', this._leftWidth);
    }

    private _handleResizeEnd = (): void => {
        this._isResizing = false;
        document.removeEventListener('mousemove', this._handleResizeMove);
        document.removeEventListener('mouseup', this._handleResizeEnd);

        const resizer = this.shadowRoot?.querySelector('.resizer') as HTMLElement;
        resizer?.classList.remove('dragging');
    }

    private _handleKeyDown(event: KeyboardEvent, node: TreeNode): void {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                this._handleNodeSelect(node.path);
                break;
            case 'ArrowRight':
                event.preventDefault();
                if (!this._expandedNodes.has(node.path.join('/'))) {
                    this._handleNodeToggle(node.path);
                }
                break;
            case 'ArrowLeft':
                event.preventDefault();
                if (this._expandedNodes.has(node.path.join('/'))) {
                    this._handleNodeToggle(node.path);
                }
                break;
        }
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
                    role="treeitem"
                    aria-expanded="${hasChildren ? isExpanded : false}"
                    aria-selected="${isSelected}"
                    tabindex="${isSelected ? '0' : '-1'}"
                    @keydown="${(e: KeyboardEvent) => this._handleKeyDown(e, node)}"
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
            <div>
                ${this._treeData.map(node => this.renderTreeNode(node))}
            </div>
        `;
    }

    private _formatListenerCount(listener: FastEventListenerMeta): string {
        const [, total, executed] = listener;
        return total === 0 ? '∞' : `${executed}/${total}`;
    }

    private _printListenerToConsole(listener: FastEventListenerMeta): void {
        const [fn] = listener;

        if (typeof fn !== 'function') {
            console.warn('监听器函数已被垃圾回收或无效');
            console.log('元数据:', {
                executed: `${listener[2]}/${listener[1]}`,
                tag: listener[3],
                flags: listener[4]
            });
            return;
        }

        console.log(`监听器: ${fn.name || 'anonymous'}`);
        console.log(fn.toString());
        console.log(`执行次数: ${listener[2]}/${listener[1]}`);
        console.log(`标签: ${listener[3]}`);
        if (listener[4] !== undefined) {
            console.log(`标识: ${listener[4]}`);
        }
    }

    private renderTag(text: string, color?: string): ReturnType<typeof html> {
        const colorClass = color ? `tag-${color}` : '';
        return html`<span class="tag ${colorClass}">${text}</span>`;
    }

    private renderIcon(name: string): ReturnType<typeof html> {
        return html`<span class="icon ${name}"></span>`;
    }

    private renderListener(listener: FastEventListenerMeta): ReturnType<typeof html> {
        const [fn, , , tag, flags] = listener;
        const functionName = fn.name || 'anonymous';

        return html`
            <div class="listener-card">
                <div class="listener-row">
                    <div class="listener-cell listener-label">函数名</div>
                    <div class="listener-cell">
                        <span
                            class="listener-function"
                            @click="${() => this._printListenerToConsole(listener)}"
                            title="点击在控制台输出监听器信息"
                        >
                            ${this.renderIcon('listeners')}
                            ${functionName}
                        </span>
                    </div>
                </div>
                <div class="listener-row">
                    <div class="listener-cell listener-label">执行次数</div>
                    <div class="listener-cell listener-value">${this._formatListenerCount(listener)}</div>
                </div>
                ${tag ? html`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标签</div>
                        <div class="listener-cell">${this.renderTag(tag)}</div>
                    </div>
                ` : ''}
                ${flags !== undefined ? html`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标识</div>
                        <div class="listener-cell listener-value">${flags}</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    private renderListeners(): ReturnType<typeof html> {
        if (this._listeners.length === 0) {
            return html`
                <div class="empty-state">
                    <span class="icon listeners"></span>
                    <p>该节点暂无监听器</p>
                </div>
            `;
        }

        return html`
            <div>
                ${this._listeners.map(listener => this.renderListener(listener))}
            </div>
        `;
    }

    override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('emitter')) {
            this._treeData = this._buildTreeData();
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();
        if (this._isResizing) {
            document.removeEventListener('mousemove', this._handleResizeMove);
            document.removeEventListener('mouseup', this._handleResizeEnd);
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
