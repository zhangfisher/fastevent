import { html } from "lit";

export interface ButtonOptions {
    icon?: string;
    pressed?: boolean;
    className?: string;
    title?: string;
}

/**
 * 渲染按钮组件
 * @param content - 按钮内容
 * @param onClick - 点击事件处理函数
 * @param options - 按钮选项
 * @returns TemplateResult
 */
export function renderButton(
    content: unknown,
    onClick: () => void,
    options: ButtonOptions = {},
) {
    const { icon, pressed, className = "", title } = options;
    const classes = ["btn", className];
    if (pressed) classes.push("btn-pressed");
    if (icon) classes.push("btn-icon");

    return html`<button
        class="${classes.join(" ")}"
        title="${title || ""}"
        @click="${onClick}"
        style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0.4em 0.8em; border: none; border-radius: 4px; background: transparent; cursor: pointer; transition: all 0.3s; user-select: none; ${
        icon ? "padding: 0.2em; width: 24px; height: 24px;" : ""
    }"
    >
        ${icon ? html`<span class="icon ${icon}"></span>` : ""}
        ${content}
    </button>`;
}
