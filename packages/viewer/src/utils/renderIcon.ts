import { html } from "lit";

/**
 * 渲染图标组件
 * @param name - 图标名称（CSS类名）
 * @param tooltip - 提示文本
 * @returns TemplateResult
 */
export function renderIcon(name: string, tooltip?: string) {
    if (tooltip) {
        return html`<span class="icon ${name}" title="${tooltip}"></span>`;
    } else {
        return html`<span class="icon ${name}"></span>`;
    }
}
