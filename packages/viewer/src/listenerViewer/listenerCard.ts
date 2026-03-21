// packages/viewer/src/listenerViewer/listenerCard.ts
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./listenerCardStyles";
import {
    isPathMatched,
    type FastEvent,
    type FastEventHooks,
    type FastEventListenerNode,
    type TypedFastEventMessage,
} from "fastevent";
import type { FastEventListenerMeta } from "fastevent";
import type { ItemOf } from "../types";
import { removeItem } from "../utils";

/**
 * fastevent-listener-card 组件 - 显示单个监听器的详细信息
 */
@customElement("fastevent-listener-card")
export class FastEventListenerCard extends LitElement {
    static styles = styles;

    @property({ attribute: false })
    emitter?: FastEvent<any, any, any>;

    @property({ attribute: false })
    listener?: FastEventListenerMeta;
    @property({ type: Boolean, reflect: true })
    dark = false;
    @property({ type: String })
    type?: string;
    connectedCallback(): void {
        super.connectedCallback();
        this._addListenerHook();
    }
    disconnectedCallback(): void {
        super.disconnectedCallback();
        this._removeListenerHook();
    }

    private _onAfterExecuteListener: ItemOf<FastEventHooks["AfterExecuteListener"]> = (
        message: TypedFastEventMessage,
        _returns: any[],
        _listeners: FastEventListenerNode[],
    ) => {
        //
        if (isPathMatched(message.type.split("/"), this.type!.split("/"))) {
            this.requestUpdate();
        }
    };

    private _addListenerHook() {
        if (this.emitter) {
            this.emitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener!);
        }
    }
    private _removeListenerHook() {
        if (this.emitter) {
            removeItem(this.emitter.hooks.AfterExecuteListener, this._onAfterExecuteListener!);
        }
    }

    private _formatListenerCount(listener: FastEventListenerMeta): string {
        const [, total, executed] = listener;
        return total === 0 ? `${executed}/∞` : `${executed}/${total}`;
    }

    getFunctionPosition(fn: Function) {
        // 将函数转换为字符串并尝试定位
        const fnStr = fn.toString();

        // 使用 Error.stack 来获取当前位置
        const stack = new Error().stack;

        // 输出函数字符串和堆栈
        console.group("函数定位");
        console.log("函数代码:", fnStr.substring(0, 200));
        console.log("当前调用栈:", stack);
        console.groupEnd();

        // 在 DevTools 中，直接打印函数对象会显示可点击的链接
        console.log(fn);
    }
    private _printListenerToConsole(listener: FastEventListenerMeta): void {
        const [fn] = listener;
        if (typeof fn !== "function") {
            console.warn("监听器函数已被垃圾回收或无效");
            console.log("元数据:", {
                executed: `${listener[2]}/${listener[1]}`,
                tag: listener[3],
                flags: listener[4],
            });
            return;
        }
        console.group(`FastEvent Listener`);
        console.log(`监听器: ${fn.name || "anonymous"}`);
        console.log(fn);
        console.log(`执行次数: ${listener[2]}/${listener[1]}`);
        console.log(`标签: ${listener[3]}`);
        if (listener[4] !== undefined) {
            console.log(`标识: ${listener[4]}`);
        }
        console.groupEnd();
    }
    private _printListenerResultToConsole(listener: FastEventListenerMeta): void {
        if (listener.length === 6) {
            console.group(`FastEvent Listener returns`);
            const result = listener[5] instanceof WeakRef ? listener[5].deref() : listener[5];
            console.log(result);
            console.groupEnd();
        }
    }

    private renderTag(text: string): ReturnType<typeof html> {
        return html`<span class="tag">${text}</span>`;
    }
    private _renderReturns(listener: FastEventListenerMeta) {
        if (listener.length === 6 && listener[5]) {
            const result = listener[5] instanceof WeakRef ? listener[5].deref() : listener[5];
            return html`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">返回值</div>
                        <div class="listener-cell listener-value" title="单击显示在控制台" style="cursor:pointer"                         
                        @click="${() => this._printListenerResultToConsole(this.listener!)}"
>${result instanceof Error ? result.stack : JSON.stringify(result)}</div>
                    </div>
                `;
        }
    }
    override render() {
        if (!this.listener) {
            return html`
                <div class="empty-state">监听器数据无效</div>
            `;
        }

        const [fn, , , tag, flags] = this.listener;
        const functionName = fn.name || "anonymous";

        return html`
            <div class="listener-card">
                <div class="listener-row">
                    <div class="listener-cell listener-label">监听函数</div>
                    <div class="listener-cell">
                        <span
                            class="listener-function"
                            @click="${() => this._printListenerToConsole(this.listener!)}"
                            title="点击在控制台输出监听器信息"
                        >
                            ${functionName}
                        </span>
                    </div>
                </div>
                <div class="listener-row">
                    <div class="listener-cell listener-label">执行次数</div>
                    <div class="listener-cell listener-value">${this._formatListenerCount(this.listener)}</div>
                </div>
                ${
                    tag
                        ? html`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标签</div>
                        <div class="listener-cell">${this.renderTag(tag)}</div>
                    </div>
                `
                        : ""
                }
                ${
                    flags !== undefined
                        ? html`
                    <div class="listener-row">
                        <div class="listener-cell listener-label">标识</div>
                        <div class="listener-cell listener-value">${flags}</div>
                    </div>
                `
                        : ""
                }
                ${this._renderReturns(this.listener)}
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listener-card": FastEventListenerCard;
    }
}
