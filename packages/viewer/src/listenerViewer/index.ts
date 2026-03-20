import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("fastevent-listeners")
export class FasteventListenerViewer extends LitElement {
    /**
     * 渲染左侧的树结构
     */
    renderTree() {}
    /**
     * 显示所有的注册的监听器
     */
    renderListeners() {}
    /**
     * 显示单个监听器
     */
    renderListener() {}
    renderTag() {}
    renderToolbar() {}
    render() {
        return html``;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listeners": FasteventListenerViewer;
    }
}
