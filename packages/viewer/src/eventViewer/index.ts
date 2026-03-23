import {
    FastEvent,
    type FastEventListenerArgs,
    type FastEventListenerMeta,
    type FastEventListenerNode,
    type FastEventMessage,
    type FastEventSubscriber,
    type FastEventListenerFlags,
} from "fastevent";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { ItemOf } from "../types";
import { styles } from "./styles";
import type { EventLog } from "./types";
import "../listenerViewer/index.js";
import { removeItem } from "../utils/removeItem";
import { renderTag, renderButton, renderIcon } from "../utils";
import { t, setLanguage } from "../utils/t";

@customElement("fastevent-viewer")
export class FastEventViewer extends LitElement {
    static styles = styles;

    @state()
    private _emitters: FastEvent[] = [];

    @state()
    private _currentEmitterIndex = 0;

    @state()
    private _isDropdownOpen = false;

    private _emitterLogs = new Map<number, EventLog[]>();
    private _emitterLogIndexes = new Map<number, number[]>();

    @property({ type: Object })
    get emitter(): FastEvent | FastEvent[] | undefined {
        return this._emitters.length === 1 ? this._emitters[0] : this._emitters;
    }

    set emitter(value: FastEvent | FastEvent[] | undefined) {
        this._emitters = Array.isArray(value) ? value : value ? [value] : [];
        if (this._currentEmitterIndex >= this._emitters.length) {
            this._currentEmitterIndex = 0;
        }
        this._reattach();
        this.requestUpdate();
    }

    @property({ type: Boolean, reflect: true })
    dark = false;

    @property({ type: Boolean, reflect: true })
    enable = true;

    /**
     * 允许显示的日志最大数量,超过此数量时自动删除旧的
     */
    @property({ type: Number })
    maxSize: number = 500;

    @property({ type: String })
    title: string = "";

    @property({ type: String, reflect: true })
    lang = "cn";

    /**
     * 是否在日志中显示监听器详情
     */
    @property({ type: Boolean })
    showListeners = true;

    @state()
    private _filterText = "";

    @state()
    private _showListeners = false;

    @state()
    private _isShowListeners = false;

    subscriber?: FastEventSubscriber;
    messages: FastEventMessage[] = [];
    logs: EventLog[] = [];
    // 用于渲染的logs数组的索引
    private _logIndexs: number[] = [];

    connectedCallback(): void {
        super.connectedCallback();
        setLanguage(this.lang);
        this._attach();
        document.addEventListener('click', this._handleDocumentClick);
    }

    disconnectedCallback(): void {
        this._detach();
        document.removeEventListener('click', this._handleDocumentClick);
    }

    willUpdate(changedProperties: Map<string, any>): void {
        if (changedProperties.has("emitter")) {
            this._reattach();
        }
        if (changedProperties.has("_filterText")) {
            this._updateFilteredLogs();
        }
        if (changedProperties.has("showListenersInLog")) {
            this._isShowListeners = this.showListeners;
        }
        if (changedProperties.has("lang")) {
            setLanguage(this.lang);
        }
    }

    private _getCurrentEmitter(): FastEvent | undefined {
        return this._emitters[this._currentEmitterIndex];
    }

    private _switchEmitter(index: number) {
        if (index === this._currentEmitterIndex) return;

        // 保存当前 emitter 的日志
        this._emitterLogs.set(this._currentEmitterIndex, [...this.logs]);
        this._emitterLogIndexes.set(this._currentEmitterIndex, [...this._logIndexs]);

        // 切换到新 emitter
        this._currentEmitterIndex = index;

        // 恢复新 emitter 的日志
        this.logs = this._emitterLogs.get(index) || [];
        this._logIndexs = this._emitterLogIndexes.get(index) || [];

        // 重新附加钩子
        this._reattach();

        // 关闭下拉菜单
        this._isDropdownOpen = false;

        this.requestUpdate();
    }

    private _handleDocumentClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const dropdown = this.renderRoot?.querySelector('.emitter-dropdown-container');
        if (dropdown && !dropdown.contains(target)) {
            this._isDropdownOpen = false;
            this.requestUpdate();
        }
    };

    private _reattach() {
        this._detach();
        this.clear();
        this._attach();
    }

    private _updateFilteredLogs() {
        const filter = this._filterText.toLowerCase().trim();
        if (!filter) {
            // 倒序：最新的在前
            this._logIndexs = this.logs.map((_, i) => i).reverse();
            return;
        }

        this._logIndexs = this.logs
            .map((log, i) => ({ log, index: i }))
            .filter(({ log }) => {
                const message = log.message.deref();
                if (!message) return false;
                return message.type.toLowerCase().includes(filter);
            })
            .map(({ index }) => index)
            .reverse(); // 倒序：最新的在前
    }

    _onBeforeExecuteListener = (message: FastEventMessage, args: FastEventListenerArgs) => {
        const currentEmitter = this._getCurrentEmitter();
        if (!currentEmitter || !this.enable) return;

        const listeners = (currentEmitter.getListeners(message.type) || []).map((meta) => {
            return this._getListenerMeta(meta, "running");
        });
        const log = {
            message: new WeakRef(message),
            done: false,
            args: new WeakRef(args),
            triggerTime: Date.now(),
            duration: [performance.now(), 0],
            listeners,
        } as EventLog;
        log.id = this.logs.length + 1;
        // 重点：用于跟踪
        (message as any).__index = log.id - 1;
        this.logs.push(log as any);
        // 倒序：将新日志索引添加到开头
        this._logIndexs.unshift(this.logs.length - 1);

        // 限制日志数量
        if (this.maxSize > 0 && this.logs.length > this.maxSize) {
            this.logs.shift();
            this._updateFilteredLogs();
        }

        this.requestUpdate();
    };

    _getListenerMeta(meta: FastEventListenerMeta, status?: any): ItemOf<EventLog["listeners"]> {
        if (status === undefined) {
            if (meta.length === 6) {
                let returns: any;
                const m = meta[5];
                if (m instanceof WeakRef) {
                    returns = m.deref();
                } else {
                    returns = m;
                }
                if (returns instanceof Error) {
                    status = "error";
                } else {
                    status = "ok";
                }
            } else {
                status = "ok";
            }
        }
        return {
            status: status,
            fn: new WeakRef(meta[0]),
            name: meta[0].name || "anonymous",
            count: `${meta[2]}/${meta[1] === 0 ? "∞" : meta[1]}`,
            tag: meta[3],
            flags: meta[4] as FastEventListenerFlags | undefined,
            result: meta[5],
        };
    }

    _onAfterExecuteListener = (
        message: FastEventMessage,
        returns: any[],
        _listeners: FastEventListenerNode[],
    ) => {
        if (!this.enable) return;

        const index = (message as any).__index;
        if (typeof index === "number") {
            const log = this.logs[index];
            if (log) {
                log.done = true;
                log.duration[1] = performance.now();
            }
            const newListeners = _listeners.reduce<EventLog["listeners"]>((result, current) => {
                current.__listeners.forEach((meta) => {
                    result.push(this._getListenerMeta(meta));
                });
                return result;
            }, []);

            // 找到对应的 log 并更新 listeners
            const logIndex = index; //this.logs.findIndex((l) => l.id === index);
            if (logIndex !== -1) {
                this.logs[logIndex].listeners = newListeners;
                returns.map((r, i) => {
                    const listener = this.logs[logIndex].listeners[i];
                    if (listener) {
                        try {
                            listener.result = structuredClone(r);
                        } catch {
                            listener.result = r;
                        }
                        if (r instanceof Error) {
                            listener.status = "error";
                        } else {
                            listener.status = "ok";
                        }
                    }
                });
            }
            delete (message as any).__index;
        }

        this.requestUpdate();
    };

    private _attach() {
        const currentEmitter = this._getCurrentEmitter();
        if (currentEmitter) {
            const options = currentEmitter.options;
            currentEmitter.hooks.BeforeExecuteListener.push(this._onBeforeExecuteListener);
            currentEmitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener);
            options.debug = true;
        }
    }

    private _detach() {
        const currentEmitter = this._getCurrentEmitter();
        if (currentEmitter) {
            removeItem(currentEmitter.hooks.BeforeExecuteListener, this._onBeforeExecuteListener);
            removeItem(currentEmitter.hooks.AfterExecuteListener, this._onAfterExecuteListener);
            const options = currentEmitter.options;
            options.debug = false;
        }
    }

    clear() {
        this.logs = [];
        this._logIndexs = [];
        this.messages = [];
        this.requestUpdate();
    }

    private _formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const ms = date.getMilliseconds().toString().padStart(3, "0");
        return `${hours}:${minutes}:${seconds}.${ms}`;
    }

    /**
     * 在控制台显示监听器函数
     * @param listener
     */
    private _printListenerInfo(listener: ItemOf<EventLog["listeners"]>) {
        const fn = listener.fn.deref();
        if (typeof fn === "function") {
            console.group("FastEvent Listener");
            console.log(t("eventViewer.listener", fn.name || "anonymous"));
            console.log(fn);
            console.log(t("eventViewer.executionResult"), listener.result);
            console.groupEnd();
        }
    }

    renderFilter() {
        return html`<input
            type="text"
            class="filter-input"
            placeholder="${t("eventViewer.filterPlaceholder")}"
            .value="${this._filterText}"
            @input="${(e: InputEvent) => {
                this._filterText = (e.target as HTMLInputElement).value;
            }}"
        />`;
    }

    private _renderEmitterDropdown(title: string) {
        console.log('[_renderEmitterDropdown] Rendering dropdown with title:', title);
        return html`
            <div class="emitter-dropdown-container">
                <button
                    class="emitter-dropdown-trigger"
                    @click="${() => {
                        console.log('[Dropdown] Click, toggling from', this._isDropdownOpen);
                        this._isDropdownOpen = !this._isDropdownOpen;
                        console.log('[Dropdown] New state:', this._isDropdownOpen);
                    }}"
                    title="${t("eventViewer.switchEmitter")}"
                >
                    <span class="header-title">${title}</span>
                    <span class="dropdown-arrow ${this._isDropdownOpen ? 'open' : ''}"></span>
                </button>
                ${this._isDropdownOpen ? this._renderEmitterMenu() : ''}
            </div>
        `;
    }

    private _renderEmitterMenu() {
        console.log('[_renderEmitterMenu] Rendering menu with', this._emitters.length, 'emitters');
        return html`
            <div class="emitter-dropdown-menu">
                ${this._emitters.map((emitter, index) => {
                    const isActive = index === this._currentEmitterIndex;
                    const menuTitle = this.title.length > 0 ? this.title : emitter?.title || `Emitter ${index + 1}`;
                    console.log(`[_renderEmitterMenu] Item ${index}:`, menuTitle, 'active:', isActive);
                    return html`
                        <div
                            class="emitter-menu-item ${isActive ? 'active' : ''}"
                            @click="${() => {
                                console.log('[Menu] Clicked item', index);
                                this._switchEmitter(index);
                            }}"
                        >
                            ${isActive ? renderIcon("yes") : ''}
                            <span>${menuTitle}</span>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    renderHeader() {
        const hasMultipleEmitters = this._emitters.length > 1;
        const currentEmitter = this._getCurrentEmitter();
        const displayTitle = this.title.length > 0 ? this.title : currentEmitter?.title || "";

        // 调试信息
        console.log('[renderHeader] _emitters:', this._emitters);
        console.log('[renderHeader] _emitters.length:', this._emitters.length);
        console.log('[renderHeader] hasMultipleEmitters:', hasMultipleEmitters);
        console.log('[renderHeader] displayTitle:', displayTitle);

        return html`
            <div class="header">
                ${hasMultipleEmitters
                    ? this._renderEmitterDropdown(displayTitle)
                    : html`<span class="header-title">${displayTitle}</span>`
                }
                ${renderButton(
                    "",
                    () => {
                        this.dark = !this.dark;
                    },
                    {
                        icon: "dark",
                        className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
                        title: this.dark ? t("eventViewer.normalMode") : t("eventViewer.darkMode"),
                    },
                )}
                ${renderButton(
                    "",
                    () => {
                        this._showListeners = !this._showListeners;
                    },
                    {
                        icon: "listeners",
                        className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
                        title: this._showListeners
                            ? t("eventViewer.showEvent")
                            : t("eventViewer.showListeners"),
                    },
                )}
            </div>
        `;
    }

    renderToolbar() {
        return html`
            <div class="toolbar">
                ${this.renderFilter()}
                <span class="toolbar-spacer">${t("eventViewer.totalLogs", this._logIndexs.length)}</span>
                ${renderButton(
                    "",
                    () => {
                        this._isShowListeners = !this._isShowListeners;
                        this.requestUpdate();
                    },
                    {
                        icon: "listener",
                        className: "btn-icon" + (this._isShowListeners ? " btn-pressed" : ""),
                        title: this._isShowListeners
                            ? t("eventViewer.hideListenerDetails")
                            : t("eventViewer.showListenerDetails"),
                    },
                )}
                <button class="btn btn-icon" title="${t("eventViewer.clear")}" @click="${() => this.clear()}">
                    <span class="icon clear"></span>
                </button>
            </div>
        `;
    }
    renderLogFlags(args: FastEventListenerArgs) {
        if (args && (args.flags || 0) > 0) {
            const flags = args.flags || 0;
            if (flags > 1) {
                return renderTag(`${args.flags}`, "orange", t("eventViewer.extendedFlags"));
            }
            return html`${(flags | 1) == 0 ? "" : renderTag(`T`, "orange", t("eventViewer.transformed"))}`;
        }
    }
    renderLog(log: EventLog) {
        const message = log.message.deref();
        const args = log.args.deref();
        if (!message) return html``;

        const payload = JSON.stringify(message.payload ?? "");
        const timeStr = this._formatTime(log.triggerTime);
        return html`
            <div class="log-item">
                <div class="log-content">
                    <div class="log-header">
                        ${log.done ? "✨" : renderIcon("loading")}
                        <span class="log-type" title="${t("eventViewer.eventType")}">${message.type}</span>
                        <span class="log-time" title="${t("eventViewer.triggerTime")}">${timeStr}</span>
                        ${renderTag(`#${log.id}`, "gray", t("eventViewer.serialNumber"))}
                        ${this._isShowListeners ? "" : renderTag(`ƒ(${log.listeners.length})`, "purple", t("eventViewer.totalListeners", log.listeners.length))}
                        ${args?.retain ? renderTag("retain", "red", t("eventViewer.retainLastEvent")) : ""}
                        ${this.renderLogFlags(args!)}
                        ${args?.rawEventType && args?.rawEventType !== message.type ? renderTag(args.rawEventType, "blue", t("eventViewer.rawEventType", args.rawEventType)) : ""}
                        ${log.duration[1] > 0 ? renderTag(`${Number((log.duration[1] - log.duration[0]).toFixed(3))}ms`, "green", t("eventViewer.executionTime")) : ""}
                        ${renderButton(
                            "",
                            () => {
                                const jsonStr = JSON.stringify(message, null, 2);
                                navigator.clipboard.writeText(jsonStr);
                            },
                            {
                                icon: "copy",
                                className: "btn-icon",
                                title: t("eventViewer.copyMessage"),
                            },
                        )}
                    </div>
                    ${payload ? html`<div class="log-payload">${payload}</div>` : ""}
                    ${
                        log.listeners.length > 0
                            ? html`
                        <div class="log-listeners ${this._isShowListeners ? "log-listeners-visible" : "log-listeners-hidden"}">
                            ${this.renderListeners(log.listeners)}
                        </div>
                    `
                            : ""
                    }
                </div>
            </div>
        `;
    }

    renderListeners(listeners: EventLog["listeners"]) {
        return html`${listeners.map((listener) => this.renderListener(listener))}`;
    }

    renderListener(listener: ItemOf<EventLog["listeners"]>) {
        const statusClass = listener.status === "ok" ? "yes" : listener.status;
        const resultText = this._formatResult(listener.result);
        return html`
            <div class="listener" >
                ${renderIcon("listener", t("eventViewer.listener"))}
                <span class="listener-name" title="${t("eventViewer.listener")}" @click="${() => this._printListenerInfo(listener)}">${listener.name}</span>
                ${listener.tag ? renderTag(listener.tag, undefined, t("eventViewer.listenerTag", listener.tag)) : ""}
                ${renderTag(listener.count, undefined, t("eventViewer.executionCount"))}
                ${listener.flags !== undefined ? renderTag(`${listener.flags}`, "orange", t("eventViewer.listenerFlags")) : ""}
                <span class="listener-status ${statusClass}" title="${resultText}">
                    ${renderIcon(listener.status === "running" ? "loading" : listener.status === "ok" ? "yes" : listener.status)}
                </span>
            </div>
        `;
    }

    private _formatResult(result: any): string {
        if (result === undefined) return t("eventViewer.executing");
        if (result === null) return "null";

        // 处理 Error 对象
        if (result instanceof Error) {
            return t("eventViewer.error", result.message);
        }

        // 处理对象和数组
        if (typeof result === "object") {
            try {
                const str = JSON.stringify(result);
                if (str.length > 100) {
                    return str.substring(0, 100) + "...";
                }
                return str;
            } catch {
                return result.toString();
            }
        }

        // 处理其他类型
        return String(result);
    }

    renderLogs() {
        if (this._logIndexs.length === 0) {
            return html`
                <div class="empty-state">
                    ${renderIcon("file")}
                    <p>${t("eventViewer.noEventLogs")}</p>
                </div>
            `;
        }

        return html`
            <div class="logs">
                ${this._logIndexs.map((index) => this.renderLog(this.logs[index]))}
            </div>
        `;
    }

    render() {
        return html`
            ${this.renderHeader()}
            ${
                this._showListeners
                    ? html`<fastevent-listeners
                        .emitter="${this._getCurrentEmitter()}"
                        .dark="${this.dark}"
                        .lang="${this.lang}">
                    </fastevent-listeners>`
                    : html`${this.renderToolbar()}${this.renderLogs()}`
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-viewer": FastEventViewer;
    }
}
