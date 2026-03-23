// packages/viewer/src/utils/renderMenu.ts
import { html } from "lit";
import type { TemplateResult } from "lit";

export interface MenuItem {
    label: string;
    onClick: () => void;
    icon?: string;
    active?: boolean;
}

export interface MenuOptions {
    dark?: boolean;
    className?: string;
}

/**
 * 渲染下拉菜单
 * @param items - 菜单项数组
 * @param options - 菜单选项
 * @returns TemplateResult
 */
export function renderMenu(
    items: MenuItem[],
    options: MenuOptions = {},
): TemplateResult {
    const { dark = false, className = "" } = options;

    return html`
        <div class="dropdown-menu ${className} ${dark ? 'dark' : ''}">
            ${items.map(item => html`
                <div
                    class="dropdown-menu-item ${item.active ? 'active' : ''}"
                    @click="${item.onClick}"
                >
                    ${item.icon ? html`<span class="icon ${item.icon}"></span>` : ''}
                    <span>${item.label}</span>
                </div>
            `)}
        </div>
    `;
}
