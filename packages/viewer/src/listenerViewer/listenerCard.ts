// packages/viewer/src/listenerViewer/listenerCard.ts
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./listenerCardStyles";
import type {
    FastEvent,
    FastEventHooks,
    FastEventListenerNode,
    TypedFastEventMessage,
} from "fastevent";
import type { FastEventListenerMeta } from "fastevent";
import type { ItemOf } from "../types";

/**
 * fastevent-listener-card 组件 - 显示单个监听器的详细信息
 */
@customElement("fastevent-listener-card")
export class FastEventListenerCard extends LitElement {
    static styles = styles;

    @property({ attribute: false })
    emitter?: FastEvent;

    @property({ attribute: false })
    listener?: FastEventListenerMeta;

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
        if (message.type === this.type) {
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
            const index = this.emitter.hooks.AfterExecuteListener.findIndex((hook) => {
                return hook === this._onAfterExecuteListener!;
            });
            if (index > -1) {
                this.emitter.hooks.AfterExecuteListener.splice(index, 1);
            }
        }
    }

    private _formatListenerCount(listener: FastEventListenerMeta): string {
        const [, total, executed] = listener;
        return total === 0 ? `${executed}/∞` : `${executed}/${total}`;
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
        console.log(`-----FastEvent Listener-----`);
        console.log(`监听器: ${fn.name || "anonymous"}`);
        console.log(fn.toString());
        console.log(`执行次数: ${listener[2]}/${listener[1]}`);
        console.log(`标签: ${listener[3]}`);
        if (listener[4] !== undefined) {
            console.log(`标识: ${listener[4]}`);
        }
    }

    private renderTag(text: string): ReturnType<typeof html> {
        return html`<span class="tag">${text}</span>`;
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
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listener-card": FastEventListenerCard;
    }
}
