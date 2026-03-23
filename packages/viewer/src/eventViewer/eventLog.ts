import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { EventLog } from "./types";
import type { ItemOf } from "../types";
import { renderTag, renderButton, renderIcon } from "../utils";
import { t } from "../utils/t";

/**
 * 事件日志组件，用于显示单条事件日志
 */
@customElement("fastevent-event-log")
export class FastEventEventLog extends LitElement {
    // 不使用 shadow DOM 以便样式能够继承
    createRenderRoot() {
        return this;
    }

    @property({ type: Object })
    log!: EventLog;

    @property({ type: Boolean })
    dark = false;

    @property({ type: Boolean })
    showListeners = false;

    @property({ type: Number, attribute: false })
    updateVersion?: number;

    @property({ attribute: false })
    onPrintListener?: (listener: ItemOf<EventLog["listeners"]>) => void;

    /**
     * 单个日志项的本地监听器显示状态
     * 用于点击监听器数量标签时切换显示
     */
    @state()
    private _localShowListeners = false;

    /**
     * 切换监听器列表的显示状态
     */
    private _toggleListeners() {
        this._localShowListeners = !this._localShowListeners;
    }

    /**
     * 格式化时间戳
     */
    private _formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const ms = date.getMilliseconds().toString().padStart(3, "0");
        return `${hours}:${minutes}:${seconds}.${ms}`;
    }

    /**
     * 渲染日志标志
     */
    private _renderLogFlags(args: any) {
        if (args && (args.flags || 0) > 0) {
            const flags = args.flags || 0;
            if (flags > 1) {
                return renderTag(
                    `${args.flags}`,
                    "orange",
                    t("eventViewer.extendedFlags"),
                    undefined,
                    this.dark,
                );
            }
            return html`${(flags | 1) == 0 ? "" : renderTag(`T`, "orange", t("eventViewer.transformed"), undefined, this.dark)}`;
        }
    }

    /**
     * 格式化监听器执行结果
     */
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

    /**
     * 渲染单个监听器
     */
    private _renderListener(listener: ItemOf<EventLog["listeners"]>) {
        const statusClass = listener.status === "ok" ? "yes" : listener.status;
        const resultText = this._formatResult(listener.result);
        return html`
            <div class="listener">
                ${renderIcon("listener", t("eventViewer.listener"))}
                <span class="listener-name" title="${t("eventViewer.listener")}" @click="${() => this.onPrintListener?.(listener)}">${listener.name}</span>
                ${listener.tag ? renderTag(listener.tag, undefined, t("eventViewer.listenerTag", listener.tag), undefined, this.dark) : ""}
                ${renderTag(listener.count, undefined, t("eventViewer.executionCount"), undefined, this.dark)}
                ${listener.flags !== undefined ? renderTag(`${listener.flags}`, "orange", t("eventViewer.listenerFlags"), undefined, this.dark) : ""}
                <span class="listener-status ${statusClass}" title="${resultText}">
                    ${renderIcon(listener.status === "running" ? "loading" : listener.status === "ok" ? "yes" : listener.status)}
                </span>
            </div>
        `;
    }

    /**
     * 渲染监听器列表
     */
    private _renderListeners(listeners: EventLog["listeners"]) {
        return html`${listeners.map((listener) => this._renderListener(listener))}`;
    }

    render() {
        const message = this.log.message.deref();
        const args = this.log.args.deref();
        if (!message) return html``;

        const payload = JSON.stringify(message.payload ?? "");
        const timeStr = this._formatTime(this.log.triggerTime);

        return html`
            <div class="log-item">
                <div class="log-content">
                    <div class="log-header">
                        ${this.log.done ? "✨" : renderIcon("loading")}
                        <span class="log-type" title="${t("eventViewer.eventType")}">${message.type}</span>
                        <span class="log-time" title="${t("eventViewer.triggerTime")}">${timeStr}</span>
                        ${renderTag(`#${this.log.id}`, "gray", t("eventViewer.serialNumber"), undefined, this.dark)}
                        ${
                            !this.showListeners
                                ? html`<span
                                  class="tag-clickable"
                                  style="cursor: pointer;"
                                  @click="${() => this._toggleListeners()}">${renderTag(`ƒ(${this.log.listeners.length})`, "purple", t("eventViewer.totalListeners", this.log.listeners.length), undefined, this.dark)}</span>`
                                : ""
                        }
                        ${args?.retain ? renderTag("retain", "red", t("eventViewer.retainLastEvent"), undefined, this.dark) : ""}
                        ${this._renderLogFlags(args!)}
                        ${args?.rawEventType && args?.rawEventType !== message.type ? renderTag(args.rawEventType, "blue", t("eventViewer.rawEventType", args.rawEventType), undefined, this.dark) : ""}
                        ${this.log.duration[1] > 0 ? renderTag(`${Number((this.log.duration[1] - this.log.duration[0]).toFixed(3))}ms`, "green", t("eventViewer.executionTime"), undefined, this.dark) : ""}
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
                        this.log.listeners.length > 0
                            ? html`
                        <div class="log-listeners ${this.showListeners || this._localShowListeners ? "log-listeners-visible" : "log-listeners-hidden"}">
                            ${this._renderListeners(this.log.listeners)}
                        </div>
                    `
                            : ""
                    }
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-event-log": FastEventEventLog;
    }
}
