import {
    FastEvent,
    type FastEventListenerArgs,
    type FastEventListenerMeta,
    type FastEventListenerNode,
    type FastEventMessage,
    type FastEventSubscriber,
} from "fastevent";
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { ItemOf } from "../types";
import { styles } from "./styles";
import type { EventLog } from "./types";

@customElement("fastevent-viewer")
export class FastEventViewer extends LitElement {
    static styles = styles;

    @property({ type: Object })
    emitter?: FastEvent;

    /**
     * 允许显示的日志最大数量,超过此数量时自动删除旧的
     */
    @property({ type: Number })
    maxSize?: number = 500;

    subscriber?: FastEventSubscriber;
    messages: FastEventMessage[] = [];
    logs: EventLog[] = [];
    private _oldBeforeExecuteListener: any;
    private _oldAfterExecuteListener: any;
    // 用于渲染的logs数组的索引
    private _logIndexs: number[] = [];

    connectedCallback(): void {
        super.connectedCallback();
        this._attach();
    }
    disconnectedCallback(): void {
        this._detach();
    }
    _onBeforeExecuteListener = (message: FastEventMessage, args: FastEventListenerArgs) => {
        const listeners = (this.emitter!.getListeners(message.type) || []).map((meta) => {
            return this._getListenerMeta(meta);
        });
        const log = {
            message: new WeakRef(message),
            args: new WeakRef(args),
            triggerTime: Date.now(),
            duration: [performance.now(), 0],
            listeners,
        } as EventLog;
        log.id = this.logs.length + 1;
        // 重点：
        (message as any).__index = log.id;
        this.logs.push(log as any);
        this._logIndexs.push(this.logs.length - 1);
    };
    _getListenerMeta(meta: FastEventListenerMeta) {
        return {
            status: meta.length === 6 ? (meta[5] instanceof Error ? "error" : "ok") : "running",
            fn: new WeakRef(meta[0]),
            name: meta[0].name || "anonymous",
            count: `${meta[2]}${meta[1]}`,
            tag: meta[3],
            falgs: meta[4],
            result: meta[5],
        };
    }
    _onAfterExecuteListener = (
        message: FastEventMessage,
        returns: any[],
        _listeners: FastEventListenerNode[],
    ) => {
        const index = (message as any).__index;
        if (typeof index === "number") {
            const log = this.logs[index];
            if (log) {
                log.duration[1] = performance.now();
            }
            log.listeners = _listeners[0].__listeners.map((listener) => {
                return this._getListenerMeta(listener);
            });
            returns.map((r, i) => {
                const listener = log.listeners[i];
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
            delete (message as any).__index;
        }
    };
    private _attach() {
        if (this.emitter) {
            const options = this.emitter.options;
            this._oldBeforeExecuteListener = options.onBeforeExecuteListener;
            this._oldAfterExecuteListener = options.onAfterExecuteListener;
            options.onBeforeExecuteListener = this._onBeforeExecuteListener;
            options.onAfterExecuteListener = this._onAfterExecuteListener;
        }
    }
    private _detach() {
        if (this.emitter) {
            const options = this.emitter.options;
            options.onBeforeExecuteListener = this._oldBeforeExecuteListener;
            options.onAfterExecuteListener = this._oldAfterExecuteListener;
        }
    }
    renderTag() {}
    renderButton() {}
    renderIcon() {}
    renderFilter() {}
    renderHeader() {
        return html``;
    }
    renderToolbar() {}
    renderLogs() {
        return html``;
    }

    renderLog(log: EventLog) {
        return html``;
    }
    renderListeners() {
        return html``;
    }
    renderListener(listener: ItemOf<EventLog["listeners"]>) {}
    renderFooter() {
        return html``;
    }
    render() {
        return html``;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-viewer": FastEventViewer;
    }
}
