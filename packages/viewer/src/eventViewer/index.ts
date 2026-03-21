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

@customElement("fastevent-viewer")
export class FastEventViewer extends LitElement {
    static styles = styles;

    @property({ type: Object })
    emitter?: FastEvent;

    @property({ type: Boolean, reflect: true })
    dark = false;

    @property({ type: Boolean, reflect: true })
    enable = true;

    /**
     * 允许显示的日志最大数量,超过此数量时自动删除旧的
     */
    @property({ type: Number })
    maxSize: number = 500;

    @state()
    private _filterText = "";

    @state()
    private _showListeners = false;

    subscriber?: FastEventSubscriber;
    messages: FastEventMessage[] = [];
    logs: EventLog[] = [];
    // 用于渲染的logs数组的索引
    private _logIndexs: number[] = [];

    connectedCallback(): void {
        super.connectedCallback();
        this._attach();
    }

    disconnectedCallback(): void {
        this._detach();
    }

    willUpdate(changedProperties: Map<string, any>): void {
        if (changedProperties.has("emitter")) {
            this._reattach();
        }
        if (changedProperties.has("_filterText")) {
            this._updateFilteredLogs();
        }
    }

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
        if (!this.enable) return;

        const listeners = (this.emitter!.getListeners(message.type) || []).map((meta) => {
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
        if (this.emitter) {
            const options = this.emitter.options;
            this.emitter.hooks.BeforeExecuteListener.push(this._onBeforeExecuteListener);
            this.emitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener);
            options.debug = true;
        }
    }

    private _detach() {
        if (this.emitter) {
            removeItem(this.emitter.hooks.BeforeExecuteListener, this._onBeforeExecuteListener);
            removeItem(this.emitter.hooks.AfterExecuteListener, this._onAfterExecuteListener);
            const options = this.emitter.options;
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

    private _getTagColor(tag: string): string {
        const colors = ["blue", "green", "orange", "red", "purple"];
        let hash = 0;
        for (let i = 0; i < tag.length; i++) {
            hash = tag.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }
    /**
     * 在控制台显示监听器函数
     * @param listener
     */
    private _printListenerInfo(listener: ItemOf<EventLog["listeners"]>) {
        const fn = listener.fn.deref();
        if (typeof fn === "function") {
            console.log("----- FastEvent Listener -----");
            console.log("监听器函数：");
            console.log(fn);
            console.log("执行结果：", listener.result);
        }
    }

    renderTag(text: string, color?: string, tooltip?: string) {
        const colorClass = color ? `tag-${color}` : `tag-${this._getTagColor(text)}`;
        return html`<span class="tag ${colorClass}" title="${tooltip || text}">${text}</span>`;
    }

    renderButton(
        content: unknown,
        onClick: () => void,
        options: { icon?: string; pressed?: boolean; className?: string; title?: string } = {},
    ) {
        const { icon, pressed, className = "", title } = options;
        const classes = [`btn`, className];
        if (pressed) classes.push("btn-pressed");
        if (icon) classes.push("btn-icon");

        return html`<button class="${classes.join(" ")}" title="${title || ""}" @click="${onClick}">
            ${icon ? html`<span class="icon ${icon}"></span>` : ""}
            ${content}
        </button>`;
    }

    renderIcon(name: string) {
        return html`<span class="icon ${name}"></span>`;
    }

    renderFilter() {
        return html`<input
            type="text"
            class="filter-input"
            placeholder="事件类型过滤"
            .value="${this._filterText}"
            @input="${(e: InputEvent) => {
                this._filterText = (e.target as HTMLInputElement).value;
            }}"
        />`;
    }

    renderHeader() {
        return html`
            <div class="header">
                <span class="header-title">FastEvent</span>
                <!-- ${this.renderButton(
                    "",
                    () => {
                        this.enable = !this.enable;
                        this.requestUpdate();
                    },
                    {
                        icon: this.enable ? "success" : "cancel",
                        pressed: this.enable,
                        className: "btn-icon",
                    },
                )} -->
                ${this.renderButton(
                    "",
                    () => {
                        this._showListeners = !this._showListeners;
                    },
                    {
                        icon: "listeners",
                        className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
                        title: "查看所有注册的监听器",
                    },
                )}
            </div>
        `;
    }

    renderToolbar() {
        return html`
            <div class="toolbar">
                ${this.renderFilter()}
                <span class="toolbar-spacer">共${this._logIndexs.length}条</span>
                <button class="btn btn-icon" title="清空" @click="${() => this.clear()}">
                    <span class="icon clear"></span>
                </button>
            </div>
        `;
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
                        ${this.renderIcon(log.done ? "file" : "loading")}
                        <span class="log-type" title="事件类型">${message.type}</span>
                        <span class="log-time" title="触发时间">${timeStr}</span>
                        ${args?.retain ? this.renderTag("retain", "red", "保留最后一次事件数据") : ""}
                        ${args?.rawEventType ? this.renderTag(args.rawEventType, "blue", `原始事件类型: ${args.rawEventType}`) : ""}
                        ${args?.flags !== undefined ? this.renderTag(`${args.flags}`, "orange", "扩展标识") : ""}
                        ${log.duration[1] > 0 ? this.renderTag(`${Number((log.duration[1] - log.duration[0]).toFixed(3))}ms`, "green", "执行耗时") : ""}
                        ${this.renderButton(
                            "",
                            () => {
                                const messageData = {
                                    type: message.type,
                                    payload: message.payload,
                                };
                                const jsonStr = JSON.stringify(messageData, null, 2);
                                navigator.clipboard.writeText(jsonStr);
                            },
                            { icon: "copy", className: "btn-icon", title: "复制完整消息" },
                        )}
                    </div>
                    ${payload ? html`<div class="log-payload">${payload}</div>` : ""}
                    ${log.listeners.length > 0 ? this.renderListeners(log.listeners) : ""}
                </div>
            </div>
        `;
    }

    renderListeners(listeners: EventLog["listeners"]) {
        return html`
            <div class="log-listeners">
                ${listeners.map((listener) => this.renderListener(listener))}
            </div>
        `;
    }

    renderListener(listener: ItemOf<EventLog["listeners"]>) {
        const statusClass = listener.status === "ok" ? "yes" : listener.status;
        const resultText = this._formatResult(listener.result);
        return html`
            <div class="listener" >
                <span class="listener-status ${statusClass}" title="${resultText}">
                    ${this.renderIcon(listener.status === "running" ? "loading" : listener.status === "ok" ? "yes" : listener.status)}
                </span>
                <span class="listener-name" title="点击的控制台输出监听器信息" @click="${() => this._printListenerInfo(listener)}">${listener.name}</span>
                ${listener.tag ? this.renderTag(listener.tag, undefined, `监听器标签: ${listener.tag}`) : ""}
                ${this.renderTag(listener.count, undefined, "执行次数计数（当前/总数）")}
                ${listener.flags !== undefined ? this.renderTag(`${listener.flags}`, "orange", "监听器标识flags") : ""}                
            </div>
        `;
    }

    private _formatResult(result: any): string {
        if (result === undefined) return "执行中...";
        if (result === null) return "null";

        // 处理 Error 对象
        if (result instanceof Error) {
            return `错误: ${result.message}`;
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
                    ${this.renderIcon("file")}
                    <p>暂无事件日志</p>
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
                        .emitter="${this.emitter}"
                        ?dark="${this.dark}">
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
