// oxlint-disable typescript/unbound-method
// packages/viewer/src/listenerViewer/index.ts
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./styles";
import type {
    AddAfterListenerHook,
    ClearListenersHook,
    FastEvent,
    FastEventListenerNode,
    RemoveListenerHook,
} from "fastevent";
import type { FastEventListenerMeta } from "fastevent";
import "./listenerCard";
import { removeItem, renderTag, renderRetainMessage } from "../utils";
import { t, setLanguage } from "../utils/t";

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
    private _selectedPath: string[] = [];

    @state()
    private _listeners: FastEventListenerMeta[] = [];

    @state()
    private _expandedNodes = new Set<string>();

    @property({ type: String, reflect: true })
    lang = "cn";

    private _leftWidth = "30%";
    private _isResizing = false;
    private _resizeStartX = 0;
    private _resizeStartWidth = 0;

    /**
     * 根据路径从 emitter.listeners 中查找节点
     */
    private _getListenerNode(path: string[]): FastEventListenerNode | null {
        if (!this.emitter?.listeners || path.length === 0) return null;

        let currentNode: any = this.emitter.listeners;

        for (const key of path) {
            if (currentNode[key]) {
                currentNode = currentNode[key];
            } else {
                return null;
            }
        }

        return currentNode as FastEventListenerNode;
    }

    /**
     * 查找第一个有监听器的节点路径
     */
    private _findFirstNodeWithListeners(): string[] | null {
        if (!this.emitter?.listeners) return null;

        const find = (node: any, path: string[]): string[] | null => {
            // 检查当前节点是否有监听器
            if (node.__listeners && node.__listeners.length > 0) {
                return path;
            }

            // 递归查找子节点
            for (const key in node) {
                if (key === "__listeners") continue;
                const found = find(node[key], [...path, key]);
                if (found) return found;
            }

            return null;
        };

        return find(this.emitter.listeners, []);
    }

    /**
     * 初始化展开状态
     */
    private _initializeExpandedNodes(): void {
        if (!this.emitter?.listeners) return;

        this._expandedNodes = new Set();

        const collectPaths = (node: any, path: string[]) => {
            this._expandedNodes.add(path.join("/"));

            for (const key in node) {
                if (key === "__listeners") continue;
                collectPaths(node[key], [...path, key]);
            }
        };

        collectPaths(this.emitter.listeners, []);
    }

    /**
     * 刷新所有数据
     */
    private _refreshData(): void {
        // 如果是首次加载数据，初始化展开状态和选中状态
        if (this.emitter && this._expandedNodes.size === 0) {
            this._initializeExpandedNodes();

            const firstPath = this._findFirstNodeWithListeners();
            if (firstPath) {
                this._selectedPath = firstPath;
                const node = this._getListenerNode(firstPath);
                this._listeners = node?.__listeners || [];
            }
        } else {
            // 如果当前选中的路径仍有监听器，更新监听器列表
            if (this._selectedPath.length > 0) {
                const node = this._getListenerNode(this._selectedPath);
                this._listeners = node?.__listeners || [];
            }
        }
    }

    /**
     * 处理节点选择
     */
    private _handleNodeSelect(event: Event): void {
        const target = event.currentTarget as HTMLElement;
        const pathStr = target.dataset.path;

        if (!pathStr) return;

        const path = pathStr.split("/");
        this._selectedPath = path;

        const node = this._getListenerNode(path);
        this._listeners = node?.__listeners || [];

        this.requestUpdate();
    }
    _onAddAfterListener: AddAfterListenerHook = (_type, _node) => {
        // 触发重新渲染以更新监听器数量显示
        this.requestUpdate();
    };
    _onRemoveListener: RemoveListenerHook = (_type, _listener, _node) => {
        // 触发重新渲染以更新监听器数量显示
        this.requestUpdate();
    };
    _onClearListeners: ClearListenersHook = () => {
        this._handleRefresh();
    };
    private _setupHooks() {
        if (this.emitter) {
            this.emitter.hooks.AddAfterListener.push(this._onAddAfterListener);
            this.emitter.hooks.RemoveListener.push(this._onRemoveListener);
            this.emitter.hooks.ClearListeners.push(this._onClearListeners);
        }
    }
    private _clearHooks() {
        if (this.emitter) {
            removeItem(this.emitter.hooks.AddAfterListener, this._onAddAfterListener);
            removeItem(this.emitter.hooks.RemoveListener, this._onRemoveListener);
            removeItem(this.emitter.hooks.ClearListeners, this._onClearListeners);
        }
    }
    /**
     * 处理节点展开/收起
     */
    private _handleNodeToggle(event: Event): void {
        const target = (event.currentTarget as HTMLElement).closest("[data-path]") as HTMLElement;
        const pathStr = target?.dataset.path;

        if (!pathStr) return;

        const pathKey = pathStr;

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

    private _handleKeyDown(event: KeyboardEvent): void {
        const target = event.currentTarget as HTMLElement;
        const pathStr = target.dataset.path;

        if (!pathStr) return;

        const pathKey = pathStr;

        switch (event.key) {
            case "Enter":
            case " ":
                event.preventDefault();
                this._handleNodeSelect(event);
                break;
            case "ArrowRight":
                event.preventDefault();
                if (!this._expandedNodes.has(pathKey)) {
                    this._handleNodeToggle(event);
                }
                break;
            case "ArrowLeft":
                event.preventDefault();
                if (this._expandedNodes.has(pathKey)) {
                    this._handleNodeToggle(event);
                }
                break;
        }
    }

    /**
     * 判断节点是否为空
     */
    private _isEmptyNode(node: any): boolean {
        const keys = Object.keys(node);
        return keys.length === 1 && node.__listeners && node.__listeners.length === 0;
    }

    /**
     * 渲染树节点
     */
    private renderTreeNode(
        node: FastEventListenerNode,
        path: string[],
        depth: number,
    ): ReturnType<typeof html> {
        const pathKey = path.join("/");
        const isExpanded = this._expandedNodes.has(pathKey);
        const isSelected = JSON.stringify(this._selectedPath) === JSON.stringify(path);

        // 获取子节点（排除 __listeners）
        const childKeys = Object.keys(node).filter((key) => key !== "__listeners");
        const hasChildren = childKeys.length > 0;

        // 获取监听器数量
        const listenerCount = node.__listeners?.length || 0;

        return html`
            <div>
                <div
                    class="tree-node ${isSelected ? "selected" : ""}"
                    style="padding-left: ${depth * 8 + 8}px"
                    role="treeitem"
                    data-path="${pathKey}"
                    aria-expanded="${hasChildren ? isExpanded : false}"
                    aria-selected="${isSelected}"
                    tabindex="${isSelected ? "0" : "-1"}"
                    @keydown="${this._handleKeyDown}"
                >
                    <span
                        class="tree-node-toggle ${isExpanded ? "expanded" : ""} ${hasChildren ? "" : "hidden"}"
                        data-path="${pathKey}"
                        @click="${this._handleNodeToggle}"
                    >
                        <span class="icon arrow"></span>
                    </span>
                    <span class="tree-node-content" data-path="${pathKey}" @click="${this._handleNodeSelect}">
                        <span class="icon listeners"></span>
                        <span class="tree-node-label">${path[path.length - 1]}</span>
                        ${
                            this.emitter?.retainedMessages.has(pathKey)
                                ? renderTag("retain", "red", t("listenerViewer.retainedMessage"))
                                : ""
                        }
                        ${
                            listenerCount > 0
                                ? html`
                            <span class="tree-node-badge">${listenerCount}</span>
                        `
                                : ""
                        }
                    </span>
                </div>
                ${
                    hasChildren && isExpanded
                        ? html`
                    <div class="tree-children">
                        ${childKeys.map((key) => {
                            const childPath = [...path, key];
                            return this.renderTreeNode(
                                node[key] as FastEventListenerNode,
                                childPath,
                                depth + 1,
                            );
                        })}
                    </div>
                `
                        : ""
                }
            </div>
        `;
    }

    /**
     * 渲染树
     */
    private renderTree(): ReturnType<typeof html> {
        const listeners = this.emitter?.listeners;
        if (!listeners || this._isEmptyNode(listeners)) {
            return html`
                <div class="empty-state">
                    <span class="icon listeners"></span>
                    <p>${t("listenerViewer.noRegisteredListeners")}</p>
                </div>
            `;
        }

        return html`
            <div>
                ${Object.keys(listeners)
                    .filter((key) => key !== "__listeners")
                    .map((key) => {
                        return this.renderTreeNode(
                            listeners[key] as FastEventListenerNode,
                            [key],
                            0,
                        );
                    })}
            </div>
        `;
    }

    private renderListener(listener: FastEventListenerMeta, type: string): ReturnType<typeof html> {
        return html`<fastevent-listener-card .listener="${listener}" .emitter="${this.emitter!}" .type="${type}" .dark="${this.dark}" .lang="${this.lang}"></fastevent-listener-card>`;
    }

    private renderListeners(): ReturnType<typeof html> {
        const pathKey = this._selectedPath.join("/");
        const message = this.emitter?.retainedMessages.get(pathKey);

        return html`
            <div>
                ${
                    message
                        ? renderRetainMessage({
                              message,
                              pathKey,
                              dark: this.dark,
                              onDelete: (key) => {
                                  this.emitter?.retainedMessages.delete(key);
                                  this.requestUpdate();
                              },
                              onPrint: (msg) => {
                                  console.group(t("listenerViewer.retainedMessage"));
                                  console.log(msg);
                                  console.groupEnd();
                              },
                              onCopy: (msg) => {
                                  const jsonStr = JSON.stringify(msg, null, 2);
                                  navigator.clipboard.writeText(jsonStr);
                              },
                          })
                        : ""
                }
                ${
                    this._listeners.length === 0
                        ? html`
                              <div class="empty-state">
                                  <span class="icon listeners" style="--icon-size: 3em"></span>
                                  <p>${t("listenerViewer.nodeHasNoListeners")}</p>
                              </div>
                          `
                        : html`
                        <div class="listeners-list">
                            ${this._listeners.map((listener) => this.renderListener(listener, pathKey))}
                        </div>
                    `
                }
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
                this._listeners = [];
                this._selectedPath = [];
                this._expandedNodes = new Set();
            }
        }
        if (changedProperties.has("lang")) {
            setLanguage(this.lang);
        }
    }

    override connectedCallback(): void {
        super.connectedCallback();

        // 组件连接时加载初始数据
        if (this.emitter) {
            this._refreshData();
            this._setupHooks();
        }
    }

    override disconnectedCallback(): void {
        super.disconnectedCallback();

        // 清理 resize 事件监听
        if (this._isResizing) {
            document.removeEventListener("mousemove", this._handleResizeMove);
            document.removeEventListener("mouseup", this._handleResizeEnd);
        }
        this._clearHooks();
    }

    override render() {
        return html`
            <div class="toolbar">
                <span class="toolbar-title">${t("listenerViewer.registeredListeners")}</span>
                <button class="btn btn-icon" title="${t("listenerViewer.refresh")}" @click="${this._handleRefresh}">
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
