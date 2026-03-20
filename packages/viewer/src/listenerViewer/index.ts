// packages/viewer/src/listenerViewer/index.ts
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    private _selectedPath: string[] = []; // TODO: 待实现

    @state()
    private _treeData: TreeNode[] = []; // TODO: 待实现

    @state()
    private _listeners: FastEventListenerMeta[] = []; // TODO: 待实现

    @state()
    private _leftWidth = "33.33%"; // TODO: 待实现

    @state()
    private _refreshing = false; // TODO: 待实现

    @state()
    private _expandedNodes = new Set<string>(); // TODO: 待实现

    // TODO: 后续步骤将实现这些方法
    private _buildTreeData(): TreeNode[] {
        return [];
    }

    private _handleNodeSelect(_path: string[]): void {
        // TODO: 待实现
    }

    private _handleNodeToggle(_path: string[]): void {
        // TODO: 待实现
    }

    private _handleRefresh(): void {}

    override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('emitter')) {
            this._treeData = this._buildTreeData();
        }
    }

    render() {
        // 暂时使用变量以避免 TypeScript 编译错误
        void this._selectedPath;
        void this._treeData;
        void this._listeners;
        void this._leftWidth;
        void this._refreshing;
        void this._expandedNodes;
        void this._handleNodeSelect;
        void this._handleNodeToggle;

        return html`
            <div class="toolbar">
                <span class="toolbar-title">已注册监听器</span>
                <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
                    <span class="icon refresh"></span>
                </button>
            </div>
            <div class="main-container">
                <div class="tree-panel">
                    <!-- TODO: 渲染树 -->
                    <p>树形结构（待实现）</p>
                </div>
                <div class="resizer"></div>
                <div class="listeners-panel">
                    <!-- TODO: 渲染监听器列表 -->
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
