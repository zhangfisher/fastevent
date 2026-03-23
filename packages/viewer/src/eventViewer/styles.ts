import { css } from "lit";
import { icons } from "../styles/icons";

export const styles = css`
    ${icons}
    :host {
        display: flex;
        flex-direction: column;
        font-family:
            -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
            sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: var(--fe-color-text, #333);
        background: var(--fe-color-bg, #fff);
        border: 1px solid var(--fe-color-border, #e8e8e8);
        border-radius: 6px;
        overflow: hidden;
    }

    :host([dark]) {
        --fe-color-text: rgba(255, 255, 255, 0.85);
        --fe-color-bg: #1f1f1f;
        --fe-color-border: #303030;
        --fe-color-header-bg: #141414;
        --fe-color-hover: rgba(255, 255, 255, 0.08);
        --fe-color-text-secondary: rgba(255, 255, 255, 0.45);
        --fe-color-input-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-text: rgba(255, 255, 255, 0.85);
        --fe-color-listener-bg: rgba(255, 255, 255, 0.04);
        --fe-color-listener-border: rgba(255, 255, 255, 0.12);
        --fe-color-listener-hover: rgba(255, 255, 255, 0.08);
    }

    .header {
        display: flex;
        align-items: center;
        padding: 1em;
        background: var(--fe-color-header-bg, #fafafa);
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        gap: 8px;
    }

    .header-title {
        flex: 1;
        font-size: 16px;
        font-weight: 600;
        color: var(--fe-color-text, #333);
    }

    .toolbar {
        display: flex;
        align-items: center;
        padding: 0.75em 1em;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        gap: 12px;
    }

    .filter-input {
        width: 20%;
        min-width: 150px;
        padding: 0.4em 0.8em;
        border: 1px solid var(--fe-color-border, #d9d9d9);
        border-radius: 6px;
        background: var(--fe-color-input-bg, #fff);
        color: var(--fe-color-text, #333);
        font-size: 13px;
        transition: all 0.3s;
    }

    .filter-input:focus {
        outline: none;
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }

    .filter-input::placeholder {
        color: var(--fe-color-text-secondary, #bfbfbf);
    }

    .toolbar-spacer {
        flex: 1;
        color: var(--fe-color-text-secondary, #999);
        font-size: 12px;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.4em 0.8em;
        border: none;
        border-radius: 4px;
        background: transparent;
        color: var(--fe-color-text, #555);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
    }

    .btn:hover {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
    }

    .btn-pressed {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
    }

    .btn-icon {
        padding: 0.2em;
        width: 24px;
        height: 24px;
    }

    .btn-pressed {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.1);
    }

    .logs {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 0;
    }

    .log-item {
        display: flex;
        align-items: flex-start;
        padding: 0.5em;
        border-radius: 4px;
        transition: background 0.2s;
        border-bottom: 1px solid var(--fe-color-border, #fcfcfc);
    }

    .log-item:hover {
        background: var(--fe-color-hover, #fdfdfd);
    }

    .log-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .log-header {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: wrap;
        padding: 0;
    }

    .log-header .icon {
        --icon-size: 16px;
        color: #818181;
        flex-shrink: 0;
    }

    .log-type {
        flex: 1;
        font-weight: 500;
        color: var(--fe-color-text, #333);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }

    .log-time {
        font-size: 12px;
        color: var(--fe-color-text-secondary, #999);
    }

    .tag {
        display: inline-flex;
        align-items: center;
        padding: 0.1em 0.4em;
        border-radius: 5px;
        font-size: 11px;
        white-space: nowrap;
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
    }

    .tag-blue {
        background: #e6f7ff;
        color: #1890ff;
        border: 1px solid #91d5ff;
    }

    .tag-green {
        background: #f6ffed;
        color: #52c41a;
        border: 1px solid #b7eb8f;
    }

    .tag-orange {
        background: #fff7e6;
        color: #fa8c16;
        border: 1px solid #ffd591;
    }

    .tag-red {
        background: #fff1f0;
        color: #ff4d4f;
        border: 1px solid #ffa39e;
    }

    .tag-purple {
        background: #f9f0ff;
        color: #722ed1;
        border: 1px solid #d3adf7;
    }

    .tag-gray {
        background: #f5f5f5;
        color: #8c8c8c;
        border: 1px solid #d9d9d9;
    }

    /* 暗黑模式下的 tag 颜色样式 */
    :host([dark]) .tag-blue {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
        border: 1px solid rgba(24, 144, 255, 0.3);
    }

    :host([dark]) .tag-green {
        background: rgba(82, 196, 26, 0.15);
        color: #73d13d;
        border: 1px solid rgba(82, 196, 26, 0.3);
    }

    :host([dark]) .tag-orange {
        background: rgba(250, 140, 22, 0.15);
        color: #ffa940;
        border: 1px solid rgba(250, 140, 22, 0.3);
    }

    :host([dark]) .tag-red {
        background: rgba(255, 77, 79, 0.15);
        color: #ff7875;
        border: 1px solid rgba(255, 77, 79, 0.3);
    }

    :host([dark]) .tag-purple {
        background: rgba(114, 46, 209, 0.15);
        color: #b37feb;
        border: 1px solid rgba(114, 46, 209, 0.3);
    }

    :host([dark]) .tag-gray {
        background: rgba(140, 140, 140, 0.15);
        color: #bfbfbf;
        border: 1px solid rgba(140, 140, 140, 0.3);
    }

    .log-payload {
        font-size: 12px;
        color: var(--fe-color-text-secondary, #999);
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.4;
        padding: 0em 20px;
        padding-top: 0px;
    }

    .log-listeners {
        padding: 0em 20px;
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .log-listeners-visible {
        display: flex;
    }

    .log-listeners-hidden {
        display: none;
    }

    .listener {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 0.25em 0.5em;
        border-radius: 8px;
        font-size: 12px;
        background: rgba(0, 0, 0, 0.03);
        border: 1px solid rgba(0, 0, 0, 0.06);
        transition: all 0.2s;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        cursor: pointer;
    }

    .listener:hover {
        background: rgba(0, 0, 0, 0.05);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    /* 暗黑模式下的 listener 样式 */
    :host([dark]) .listener {
        background: var(--fe-color-listener-bg, rgba(255, 255, 255, 0.04));
        border: 1px solid var(--fe-color-listener-border, rgba(255, 255, 255, 0.12));
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }

    :host([dark]) .listener:hover {
        background: var(--fe-color-listener-hover, rgba(255, 255, 255, 0.08));
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }

    .listener-status {
        width: 14px;
        height: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .listener-status .icon {
        --icon-size: 12px;
    }

    .listener-status.running .icon {
        color: #1890ff;
    }

    .listener-status.yes .icon {
        color: #52c41a;
    }

    .listener-status.error .icon {
        color: #ff4d4f;
    }

    .listener-name {
        font-weight: 500;
        color: var(--fe-color-text, #333);
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
        font-size: 11px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2em;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }

    .empty-state .icon {
        --icon-size: 48px;
        opacity: 0.3;
    }

    /* Emitter 下拉容器 */
    .emitter-dropdown-container {
        position: relative;
        flex: 1;
    }

    /* 下拉触发按钮 */
    .emitter-dropdown-trigger {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        cursor: pointer;
        transition: all 0.3s;
    }

    .emitter-dropdown-trigger:hover .header-title {
        color: #1890ff;
    }

    /* 下拉箭头 */
    .dropdown-arrow {
        display: inline-block;
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid currentColor;
        transition: transform 0.3s;
        opacity: 0.6;
    }

    .dropdown-arrow.open {
        transform: rotate(180deg);
    }

    /* 下拉菜单容器 */
    .emitter-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        min-width: 180px;
        background: #ffffff;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        overflow: hidden;
        animation: dropdownFadeIn 0.2s ease-out;
    }

    @keyframes dropdownFadeIn {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* 菜单项 */
    .emitter-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        color: #333;
    }

    .emitter-menu-item:hover {
        background: #f5f5f5;
    }

    .emitter-menu-item.active {
        background: #e6f7ff;
        color: #1890ff;
        font-weight: 500;
    }

    .emitter-menu-item .icon {
        --icon-size: 14px;
        color: #52c41a;
    }

    /* 通用下拉菜单样式（供 renderMenu 使用） */
    .dropdown-menu {
        padding: 4px 0;
        min-width: 150px;
        background: var(--fe-color-bg, #fff);
        border: 1px solid var(--fe-color-border, #e8e8e8);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dropdown-menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        cursor: pointer;
        transition: background 0.2s;
        font-size: 14px;
        color: var(--fe-color-text, #333);
    }

    .dropdown-menu-item:hover {
        background: var(--fe-color-hover, #f5f5f5);
    }

    .dropdown-menu-item.active {
        background: #e6f7ff;
        color: #1890ff;
    }

    :host([dark]) .emitter-dropdown-menu {
        background: #2a2a2a;
        border-color: #404040;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    :host([dark]) .emitter-menu-item {
        color: rgba(255, 255, 255, 0.85);
    }

    :host([dark]) .emitter-menu-item:hover {
        background: rgba(255, 255, 255, 0.06);
    }

    :host([dark]) .emitter-menu-item.active {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
    }

    :host([dark]) .dropdown-menu {
        background: var(--fe-color-bg, #2a2a2a);
        border-color: var(--fe-color-border, #404040);
    }

    :host([dark]) .dropdown-menu-item.active {
        background: rgba(24, 144, 255, 0.15);
        color: #40a9ff;
    }
`;
