import { html } from "lit";

export interface TagColors {
    bg: string;
    color: string;
    border?: string;
}

// 默认颜色方案
const defaultColors: TagColors = {
    bg: "#f0f0f0",
    color: "#666",
    border: "#d9d9d9",
};

// 预定义颜色方案
const colorSchemes: Record<string, TagColors> = {
    blue: { bg: "#e6f7ff", color: "#1890ff", border: "#91d5ff" },
    green: { bg: "#f6ffed", color: "#52c41a", border: "#b7eb8f" },
    orange: { bg: "#fff7e6", color: "#fa8c16", border: "#ffd591" },
    red: { bg: "#fff1f0", color: "#ff4d4f", border: "#ffa39e" },
    purple: { bg: "#f9f0ff", color: "#722ed1", border: "#d3adf7" },
    gray: { bg: "#f5f5f5", color: "#8c8c8c", border: "#d9d9d9" },
};

/**
 * 根据文本生成颜色
 */
function getTagColor(text: string): string {
    const colors = ["blue", "green", "orange", "red", "purple"];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export type TagOptions = {
    tooltip?: string;
    onClick?: () => void;
    className?: string;
    styles: string;
};

/**
 * 渲染标签组件
 * @param text - 标签文本
 * @param color - 颜色名称 (blue, green, orange, red, purple, gray)
 * @param tooltip - 提示文本
 * @param className - 额外的CSS类名
 * @returns TemplateResult
 */
export function renderTag(
    text: string,
    color?: keyof typeof colorSchemes,
    tooltip?: string,
    className?: string,
): ReturnType<typeof html>;

/**
 * 渲染标签组件（选项模式）
 * @param text - 标签文本
 * @param options - 标签选项
 * @returns TemplateResult
 */
export function renderTag(
    text: string,
    options?: TagOptions,
): ReturnType<typeof html>;

export function renderTag(
    text: string,
    colorOrOptions?: keyof typeof colorSchemes | TagOptions,
    tooltip?: string,
    className?: string,
) {
    // 判断是选项模式还是颜色模式
    const isOptionsMode =
        typeof colorOrOptions === "object" && colorOrOptions !== null && "styles" in colorOrOptions;

    if (isOptionsMode) {
        // 选项模式
        const options = colorOrOptions as TagOptions;
        const classes = ["tag", options.className].filter(Boolean).join(" ");

        return html`<span
            class="${classes}"
            title="${options.tooltip || text}"
            style="${options.styles}"
            @click="${options.onClick}"
        >
            ${text}
        </span>`;
    } else {
        // 颜色模式
        const color = colorOrOptions as keyof typeof colorSchemes | undefined;
        const colorKey = color || getTagColor(text);
        const colors = colorSchemes[colorKey] || defaultColors;

        const classes = ["tag", className].filter(Boolean).join(" ");

        return html`<span
            class="${classes}"
            title="${tooltip || text}"
            style="display: inline-flex; align-items: center; padding: 0.1em 0.4em; border-radius: 5px; font-size: 11px; white-space: nowrap; background: ${colors.bg}; color: ${colors.color}; ${
            colors.border ? `border: 1px solid ${colors.border};` : ""
        }"
        >
            ${text}
        </span>`;
    }
}
