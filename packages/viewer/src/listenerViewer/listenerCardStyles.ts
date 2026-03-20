// packages/viewer/src/listenerViewer/listenerCardStyles.ts
import { css } from "lit";

export const styles = css`
    :host {
        display: block;
    }

    .listener-card {
        display: table;
        width: 100%;
        padding: 0px;
        margin-bottom: 8px;
        border-radius: 6px;
        border: 1px solid var(--fe-color-border, #e8e8e8);
        transition: all 0.2s;
        box-sizing: border-box;
        background-color: #f9f9f9;
    }

    .listener-card:hover {
        /* border-color: #1890ff; */
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .listener-row {
        display: table-row;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
    }

    .listener-row:last-child {
        border-bottom: none;
    }

    .listener-cell {
        display: table-cell;
        padding: 4px 8px;
        vertical-align: middle;
        border-right: 1px solid var(--fe-color-border, #e8e8e8);
    }

    .listener-cell:first-child {
        width: 80px;
        min-width: 80px;
    }

    .listener-cell:last-child {
        border-right: none;
    }

    .listener-label {
        color: var(--fe-color-text-secondary, #999);
        font-size: 12px;
        font-weight: 500;
    }

    .listener-value {
        color: var(--fe-color-text, #333);
        font-size: 13px;
    }

    .listener-function {
        font-family: "SFMono-Regular", Consolas, monospace;
        color: #1890ff;
        cursor: pointer;
        text-decoration: underline;
    }

    .listener-function:hover {
        color: #40a9ff;
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

    .empty-state {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1em;
        color: var(--fe-color-text-secondary, #999);
        text-align: center;
    }
`;
