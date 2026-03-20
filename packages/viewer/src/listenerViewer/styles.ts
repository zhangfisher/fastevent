// packages/viewer/src/listenerViewer/styles.ts
import { css } from "lit";

export const styles = css`
    :host {
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
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
        --fe-color-bg-secondary: rgba(255, 255, 255, 0.05);
        --fe-color-tag-bg: rgba(255, 255, 255, 0.08);
        --fe-color-tag-text: rgba(255, 255, 255, 0.85);
        --fe-left-width: 33.33%;
    }

    :host {
        --fe-left-width: 33.33%;
    }

    .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75em 1em;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
        background: var(--fe-color-header-bg, #fafafa);
    }

    .toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--fe-color-text, #333);
    }

    .main-container {
        display: flex;
        flex: 1;
        overflow: hidden;
        position: relative;
    }

    .tree-panel {
        flex: 0 0 var(--fe-left-width, 33.33%);
        overflow-y: auto;
        overflow-x: hidden;
        border-right: 1px solid var(--fe-color-border, #e8e8e8);
        padding: 8px;
    }

    .tree-panel::-webkit-scrollbar {
        width: 2px;
    }
    .tree-panel::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .tree-panel:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
    }

    .listeners-panel {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        padding: 8px;
    }

    .listeners-panel::-webkit-scrollbar {
        width: 2px;
    }
    .listeners-panel::-webkit-scrollbar-thumb {
        background: transparent;
    }
    .listeners-panel:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
    }

    .resizer {
        width: 8px;
        cursor: col-resize;
        background: transparent;
        position: relative;
        z-index: 10;
        flex-shrink: 0;
        user-select: none;
    }

    .resizer::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 4px;
        height: 40px;
        background: var(--fe-color-border, #e8e8e8);
        border-radius: 2px;
        opacity: 0;
        transition: opacity 0.2s, height 0.2s;
    }

    .resizer:hover::after {
        opacity: 1;
        background: #1890ff;
    }

    .resizer.dragging::after {
        opacity: 1;
        background: #1890ff;
        height: 60px;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3em;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }

    .icon {
        --icon-size: 16px;
        display: inline-block;
        background-color: currentColor;
        mask-size: cover;
        -webkit-mask-size: cover;
        vertical-align: text-bottom;
        position: relative;
        width: var(--icon-size);
        height: var(--icon-size);
    }

    .icon.listeners {
        mask-image: var(--icon-listeners);
        -webkit-mask-image: var(--icon-listeners);
    }

    .icon.refresh {
        mask-image: var(--icon-refresh);
        -webkit-mask-image: var(--icon-refresh);
    }

    .icon.arrow {
        mask-image: var(--icon-arrow);
        -webkit-mask-image: var(--icon-arrow);
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
        color: var(--fe-color-text, #333);
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;
    }

    .btn:hover {
        color: #1890ff;
        background: rgba(24, 144, 255, 0.06);
    }

    .btn-icon {
        padding: 0.2em;
        width: 24px;
        height: 24px;
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

    .tree-node {
        display: flex;
        align-items: center;
        padding: 4px 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
        user-select: none;
    }

    .tree-node:hover {
        background: var(--fe-color-hover, #fafafa);
    }

    .tree-node.selected {
        background: rgba(24, 144, 255, 0.1);
    }

    .tree-node-toggle {
        width: 16px;
        height: 16px;
        margin-right: 4px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
    }

    .tree-node-toggle.expanded {
        transform: rotate(90deg);
    }

    .tree-node-toggle.hidden {
        visibility: hidden;
    }

    .tree-node-content {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
    }

    .tree-node-label {
        font-family: "SFMono-Regular", Consolas, monospace;
        font-size: 13px;
    }

    .tree-node-badge {
        background: var(--fe-color-tag-bg, #f0f0f0);
        color: var(--fe-color-tag-text, #666);
        padding: 2px 6px;
        border-radius: 8px;
        font-size: 11px;
    }

    .tree-children {
        padding-left: 16px;
    }
`;
