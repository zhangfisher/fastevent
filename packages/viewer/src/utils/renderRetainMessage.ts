import { html } from "lit";
import { renderButton } from "./index";

export interface RetainMessageOptions {
    message: any;
    pathKey: string;
    dark?: boolean;
    onDelete?: (pathKey: string) => void;
    onPrint?: (message: any) => void;
    onCopy?: (message: any) => void;
}

/**
 * 渲染保留消息卡片
 * @param options - 保留消息选项
 * @returns TemplateResult
 */
export function renderRetainMessage(options: RetainMessageOptions) {
    const { message, pathKey, dark = false, onDelete, onPrint, onCopy } = options;

    const messageStr = JSON.stringify(message, null, 2);
    const hasMore = messageStr.split("\n").length > 15;
    const displayStr = hasMore
        ? messageStr.split("\n").slice(0, 5).join("\n") + "\n..."
        : messageStr;

    return html`
        <div class="retained-message-card${dark ? " dark" : ""}">
            <div class="retained-message-header">
                <span class="retained-message-title">保留消息</span>
                <div class="retained-message-actions">
                    ${renderButton("", () => onDelete?.(pathKey), {
                        icon: "delete",
                        className: "btn-icon",
                        title: "删除保留消息",
                    })}
                    ${renderButton("", () => onPrint?.(message), {
                        icon: "listeners",
                        className: "btn-icon",
                        title: "打印到控制台",
                    })}
                    ${renderButton("", () => onCopy?.(message), {
                        icon: "copy",
                        className: "btn-icon",
                        title: "复制消息内容",
                    })}
                </div>
            </div>
            <div class="retained-message-content">
                <pre class="retained-message-text">${displayStr}</pre>
            </div>
        </div>
    `;
}
