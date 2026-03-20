# FastEventListeners 组件实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标:** 实现 FastEventListeners Web Component，提供树形结构浏览和查看 FastEvent 实例中所有已注册监听器，并集成到 FastEventViewer 中

**架构:** 使用 Lit 框架创建独立的 fastevent-listeners Web Component，通过模式切换集成到现有的 fastevent-viewer 组件。组件采用左右分栏布局，左侧显示事件树，右侧显示监听器详情。

**技术栈:** Lit 3.x, TypeScript, CSS (Lit css 标签函数), SVG mask-image 图标

---

## 文件结构

### 新建文件
- `packages/viewer/src/listenerViewer/index.ts` - FastEventListeners 组件主实现（~500 行）
- `packages/viewer/src/listenerViewer/styles.ts` - 组件样式定义（~400 行）

### 修改文件
- `packages/viewer/src/eventViewer/index.ts` - 添加模式切换功能（~20 行改动）
- `packages/viewer/src/eventViewer/styles.ts` - 添加按钮按下状态样式（~5 行）

### 导出更新
- `packages/viewer/src/index.ts` - 导出新组件（如需要）

---

## Chunk 1: FastEventListeners 基础框架

### Task 1: 创建 FastEventListeners 组件基础结构

**文件:**
- 创建: `packages/viewer/src/listenerViewer/index.ts`
- 创建: `packages/viewer/src/listenerViewer/styles.ts`

- [ ] **步骤 1: 创建 styles.ts 并添加基础样式**

```typescript
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
`;
```

- [ ] **步骤 2: 创建 index.ts 基础组件框架**

```typescript
// packages/viewer/src/listenerViewer/index.ts
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./styles";
import type { FastEvent } from "fastevent";
import type { FastEventListenerMeta, FastListeners } from "fastevent/types";

interface TreeNode {
    key: string;
    path: string[];
    listeners: FastEventListenerMeta[];
    listenerCount: number;
    children: TreeNode[];
    depth: number;
}

@customElement("fastevent-listeners")
export class FastEventListeners extends LitElement {
    static styles = styles;

    @property({ type: Object })
    emitter?: FastEvent;

    @property({ type: Boolean, reflect: true })
    dark = false;

    @state()
    private _selectedPath: string[] = [];

    @state()
    private _treeData: TreeNode[] = [];

    @state()
    private _listeners: FastEventListenerMeta[] = [];

    @state()
    private _leftWidth = "33.33%";

    @state()
    private _refreshing = false;

    @state()
    private _expandedNodes = new Set<string>();

    // TODO: 后续步骤将实现这些方法
    private _buildTreeData(): TreeNode[] {
        return [];
    }

    private _handleNodeSelect(_path: string[]): void {}

    private _handleNodeToggle(_path: string[]): void {}

    private _handleRefresh(): void {}

    override willUpdate(changedProperties: Map<PropertyKey, unknown>): void {
        super.willUpdate(changedProperties);
        if (changedProperties.has('emitter')) {
            this._treeData = this._buildTreeData();
        }
    }

    render() {
        return html`
            <div class="toolbar">
                <span class="toolbar-title">已注册监听器</span>
                <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
                    <span class="icon refresh"></span>
                </button>
            </div>
            <div class="main-container">
                <div class="tree-panel">
                    <!-- TODO: 渲染树 -->
                    <p>树形结构（待实现）</p>
                </div>
                <div class="resizer"></div>
                <div class="listeners-panel">
                    <!-- TODO: 渲染监听器列表 -->
                    <p>监听器列表（待实现）</p>
                </div>
            </div>
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "fastevent-listeners": FastEventListeners;
    }
}
```

- [ ] **步骤 3: 验证图标变量存在**

确认 icons.css 包含所需图标：
```bash
grep -E "icon-listeners|icon-refresh|icon-arrow" packages/viewer/src/styles/icons.css
```
预期：看到三个图标的定义

- [ ] **步骤 4: 在 demo.ts 中添加组件使用示例**

在 `packages/viewer/src/demo.ts` 中添加测试代码（可选，用于开发测试）

- [ ] **步骤 5: 运行构建验证类型正确**

```bash
cd packages/viewer && bun run build
```

预期：构建成功，无 TypeScript 错误

- [ ] **步骤 6: 提交基础框架**

```bash
git add packages/viewer/src/listenerViewer/
git commit -m "feat(fastevent-listeners): 创建组件基础框架和样式"
```

---

## Chunk 2: 树数据构建和节点选择逻辑

### Task 2: 实现树数据构建算法

**文件:**
- 修改: `packages/viewer/src/listenerViewer/index.ts`

- [ ] **步骤 1: 实现 _buildTreeData 方法**

```typescript
private _buildTreeData(): TreeNode[] {
    if (!this.emitter?.listeners) return [];

    const build = (node: FastListeners, path: string[], depth: number): TreeNode[] => {
        const children: TreeNode[] = [];

        for (const key in node) {
            if (key === '__listeners') continue;

            const childPath = [...path, key];
            const child = node[key] as FastListeners;

            children.push({
                key,
                path: childPath,
                listeners: child.__listeners || [],
                listenerCount: child.__listeners?.length || 0,
                children: build(child, childPath, depth + 1),
                depth
            });
        }

        return children;
    };

    return build(this.emitter.listeners, [], 0);
}
```

- [ ] **步骤 2: 实现 _initializeExpandedNodes 方法**

```typescript
private _initializeExpandedNodes(): void {
    this._expandedNodes = new Set();

    const collectPaths = (nodes: TreeNode[]) => {
        for (const node of nodes) {
            this._expandedNodes.add(node.path.join('/'));
            if (node.children.length > 0) {
                collectPaths(node.children);
            }
        }
    };

    collectPaths(this._treeData);
}
```

- [ ] **步骤 3: 实现 _findFirstNodeWithListeners 方法**

```typescript
private _findFirstNodeWithListeners(): TreeNode | null {
    const find = (nodes: TreeNode[]): TreeNode | null => {
        for (const node of nodes) {
            if (node.listenerCount > 0) {
                return node;
            }
            const found = find(node.children);
            if (found) return found;
        }
        return null;
    };

    return find(this._treeData);
}
```

- [ ] **步骤 4: 添加生命周期钩子**

```typescript
override willUpdate(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("emitter")) {
        this._treeData = this._buildTreeData();
    }
}

override updated(): void {
    // 当树数据变化时初始化展开状态和选中状态
    if (this._treeData.length > 0 && this._expandedNodes.size === 0) {
        this._initializeExpandedNodes();

        const firstNode = this._findFirstNodeWithListeners();
        if (firstNode) {
            this._selectedPath = firstNode.path;
            this._listeners = firstNode.listeners;
        }
    }
}
```

- [ ] **步骤 5: 实现节点选择和切换方法**

```typescript
private _handleNodeSelect(path: string[]): void {
    this._selectedPath = path;

    const findNode = (nodes: TreeNode[], targetPath: string[]): TreeNode | null => {
        for (const node of nodes) {
            if (JSON.stringify(node.path) === JSON.stringify(targetPath)) {
                return node;
            }
            const found = findNode(node.children, targetPath);
            if (found) return found;
        }
        return null;
    };

    const node = findNode(this._treeData, path);
    this._listeners = node?.listeners || [];
    this.requestUpdate();
}

private _handleNodeToggle(path: string[]): void {
    const pathKey = path.join('/');
    if (this._expandedNodes.has(pathKey)) {
        this._expandedNodes.delete(pathKey);
    } else {
        this._expandedNodes.add(pathKey);
    }
    this.requestUpdate();
}
```

- [ ] **步骤 6: 实现 _handleRefresh**

```typescript
private _handleRefresh(): void {
    this._treeData = this._buildTreeData();
    this._initializeExpandedNodes();

    const firstNode = this._findFirstNodeWithListeners();
    if (firstNode) {
        this._selectedPath = firstNode.path;
        this._listeners = firstNode.listeners;
    } else {
        this._selectedPath = [];
        this._listeners = [];
    }

    this.requestUpdate();
}
```

- [ ] **步骤 7: 提交树数据构建逻辑**

```bash
git add packages/viewer/src/listenerViewer/index.ts
git commit -m "feat(fastevent-listeners): 实现树数据构建和节点选择逻辑"
```

---

## Chunk 3: 树形结构渲染

### Task 3: 实现树节点渲染

**文件:**
- 修改: `packages/viewer/src/listenerViewer/index.ts`
- 修改: `packages/viewer/src/listenerViewer/styles.ts`

- [ ] **步骤 1: 在 styles.ts 中添加树节点样式**

```css
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
```

- [ ] **步骤 2: 实现 renderTreeNode 方法**

```typescript
private renderTreeNode(node: TreeNode): ReturnType<typeof html> {
    const pathKey = node.path.join('/');
    const isExpanded = this._expandedNodes.has(pathKey);
    const isSelected = JSON.stringify(this._selectedPath) === JSON.stringify(node.path);
    const hasChildren = node.children.length > 0;

    return html`
        <div>
            <div
                class="tree-node ${isSelected ? 'selected' : ''}"
                style="padding-left: ${node.depth * 16 + 8}px"
            >
                <span
                    class="tree-node-toggle ${isExpanded ? 'expanded' : ''} ${hasChildren ? '' : 'hidden'}"
                    @click="${(e: Event) => {
                        e.stopPropagation();
                        this._handleNodeToggle(node.path);
                    }}"
                >
                    <span class="icon arrow"></span>
                </span>
                <span class="tree-node-content" @click="${() => this._handleNodeSelect(node.path)}">
                    <span class="icon listeners"></span>
                    <span class="tree-node-label">${node.key}</span>
                    ${node.listenerCount > 0 ? html`
                        <span class="tree-node-badge">${node.listenerCount}</span>
                    ` : ''}
                </span>
            </div>
            ${hasChildren && isExpanded ? html`
                <div class="tree-children">
                    ${node.children.map(child => this.renderTreeNode(child))}
                </div>
            ` : ''}
        </div>
    `;
}
```

- [ ] **步骤 3: 实现 renderTree 方法**

```typescript
private renderTree(): ReturnType<typeof html> {
    if (this._treeData.length === 0) {
        return html`
            <div class="empty-state">
                <span class="icon listeners"></span>
                <p>暂无注册的监听器</p>
            </div>
        `;
    }

    return html`
        <div role="tree">
            ${this._treeData.map(node => this.renderTreeNode(node))}
        </div>
    `;
}
```

- [ ] **步骤 4: 更新 render 方法使用树渲染**

```typescript
render() {
    return html`
        <div class="toolbar">
            <span class="toolbar-title">已注册监听器</span>
            <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
                <span class="icon refresh"></span>
            </button>
        </div>
        <div class="main-container">
            <div class="tree-panel">
                ${this.renderTree()}
            </div>
            <div class="resizer"></div>
            <div class="listeners-panel">
                <p>监听器列表（待实现）</p>
            </div>
        </div>
    `;
}
```

- [ ] **步骤 5: 测试树渲染**

```bash
# 在浏览器中打开 demo 页面或创建简单测试
# 应该能看到树形结构，点击节点可以选中
```

- [ ] **步骤 6: 提交树渲染功能**

```bash
git add packages/viewer/src/listenerViewer/
git commit -m "feat(fastevent-listeners): 实现树形结构渲染和交互"
```

---

## Chunk 4: 监听器列表渲染

### Task 4: 实现监听器卡片显示

**文件:**
- 修改: `packages/viewer/src/listenerViewer/index.ts`
- 修改: `packages/viewer/src/listenerViewer/styles.ts`

- [ ] **步骤 1: 在 styles.ts 中添加监听器卡片样式**

```css
.listener-card {
    display: table;
    width: 100%;
    padding: 12px;
    margin-bottom: 8px;
    background: var(--fe-color-bg-secondary, #fafafa);
    border-radius: 6px;
    border: 1px solid var(--fe-color-border, #e8e8e8);
    transition: all 0.2s;
}

.listener-card:hover {
    border-color: #1890ff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.listener-row {
    display: table-row;
}

.listener-cell {
    display: table-cell;
    padding: 4px 8px;
    vertical-align: middle;
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
```

- [ ] **步骤 2: 实现 _formatListenerCount 辅助方法**

```typescript
private _formatListenerCount(listener: FastEventListenerMeta): string {
    const [, total, executed] = listener;
    return total === 0 ? '∞' : `${executed}/${total}`;
}
```

- [ ] **步骤 3: 实现 _printListenerToConsole 方法**

```typescript
private _printListenerToConsole(listener: FastEventListenerMeta): void {
    const [fn] = listener;

    if (typeof fn !== 'function') {
        console.warn('监听器函数已被垃圾回收或无效');
        console.log('元数据:', {
            executed: `${listener[2]}/${listener[1]}`,
            tag: listener[3],
            flags: listener[4]
        });
        return;
    }

    console.log(`监听器: ${fn.name || 'anonymous'}`);
    console.log(fn.toString());
    console.log(`执行次数: ${listener[2]}/${listener[1]}`);
    console.log(`标签: ${listener[3]}`);
    if (listener[4] !== undefined) {
        console.log(`标识: ${listener[4]}`);
    }
}
```

- [ ] **步骤 4: 实现 renderTag 和 renderIcon 辅助方法**

```typescript
private renderTag(text: string, color?: string): ReturnType<typeof html> {
    const colorClass = color ? `tag-${color}` : '';
    return html`<span class="tag ${colorClass}">${text}</span>`;
}

private renderIcon(name: string): ReturnType<typeof html> {
    return html`<span class="icon ${name}"></span>`;
}
```

- [ ] **步骤 5: 实现 renderListener 方法**

```typescript
private renderListener(listener: FastEventListenerMeta): ReturnType<typeof html> {
    const [fn, total, executed, tag, flags] = listener;
    const functionName = fn.name || 'anonymous';

    return html`
        <div class="listener-card">
            <div class="listener-row">
                <div class="listener-cell listener-label">函数名</div>
                <div class="listener-cell">
                    <span
                        class="listener-function"
                        @click="${() => this._printListenerToConsole(listener)}"
                        title="点击在控制台输出监听器信息"
                    >
                        ${this.renderIcon('listeners')}
                        ${functionName}
                    </span>
                </div>
            </div>
            <div class="listener-row">
                <div class="listener-cell listener-label">执行次数</div>
                <div class="listener-cell listener-value">${this._formatListenerCount(listener)}</div>
            </div>
            ${tag ? html`
                <div class="listener-row">
                    <div class="listener-cell listener-label">标签</div>
                    <div class="listener-cell">${this.renderTag(tag)}</div>
                </div>
            ` : ''}
            ${flags !== undefined ? html`
                <div class="listener-row">
                    <div class="listener-cell listener-label">标识</div>
                    <div class="listener-cell listener-value">${flags}</div>
                </div>
            ` : ''}
        </div>
    `;
}
```

- [ ] **步骤 6: 实现 renderListeners 方法**

```typescript
private renderListeners(): ReturnType<typeof html> {
    if (this._listeners.length === 0) {
        return html`
            <div class="empty-state">
                <span class="icon listeners"></span>
                <p>该节点暂无监听器</p>
            </div>
        `;
    }

    return html`
        <div>
            ${this._listeners.map(listener => this.renderListener(listener))}
        </div>
    `;
}
```

- [ ] **步骤 7: 更新 render 方法使用监听器渲染**

```typescript
render() {
    return html`
        <div class="toolbar">
            <span class="toolbar-title">已注册监听器</span>
            <button class="btn btn-icon" title="刷新" @click="${this._handleRefresh}">
                <span class="icon refresh"></span>
            </button>
        </div>
        <div class="main-container">
            <div class="tree-panel">
                ${this.renderTree()}
            </div>
            <div class="resizer"></div>
            <div class="listeners-panel">
                ${this.renderListeners()}
            </div>
        </div>
    `;
}
```

- [ ] **步骤 8: 测试监听器列表渲染**

```bash
# 在浏览器中测试：
# 1. 点击树节点，右侧应显示对应的监听器列表
# 2. 点击函数名，控制台应输出监听器信息
# 3. 检查标签和标识显示
```

- [ ] **步骤 9: 提交监听器列表渲染**

```bash
git add packages/viewer/src/listenerViewer/
git commit -m "feat(fastevent-listeners): 实现监听器列表渲染"
```

---

## Chunk 5: 拖动调整宽度功能

### Task 5: 实现左右宽度拖动调整

**文件:**
- 修改: `packages/viewer/src/listenerViewer/index.ts`

- [ ] **步骤 1: 添加拖动相关的状态和方法**

```typescript
@state()
private _isResizing = false;

private _resizeStartX = 0;
private _resizeStartWidth = 0;

private _handleResizeStart(event: MouseEvent): void {
    this._isResizing = true;
    this._resizeStartX = event.clientX;
    this._resizeStartWidth = (this.shadowRoot?.querySelector('.tree-panel') as HTMLElement)?.offsetWidth || 0;

    document.addEventListener('mousemove', this._handleResizeMove);
    document.addEventListener('mouseup', this._handleResizeEnd);

    const resizer = this.shadowRoot?.querySelector('.resizer') as HTMLElement;
    resizer?.classList.add('dragging');
}

private _handleResizeMove = (event: MouseEvent): void => {
    if (!this._isResizing) return;

    const offsetX = event.clientX - this._resizeStartX;
    const containerWidth = (this.shadowRoot?.querySelector('.main-container') as HTMLElement)?.offsetWidth || 0;
    const newWidthPercent = (this._resizeStartWidth + offsetX) / containerWidth * 100;
    const clampedWidth = Math.max(20, Math.min(80, newWidthPercent));

    this._leftWidth = `${clampedWidth}%`;
    this.style.setProperty('--fe-left-width', this._leftWidth);
}

private _handleResizeEnd = (): void => {
    this._isResizing = false;
    document.removeEventListener('mousemove', this._handleResizeMove);
    document.removeEventListener('mouseup', this._handleResizeEnd);

    const resizer = this.shadowRoot?.querySelector('.resizer') as HTMLElement;
    resizer?.classList.remove('dragging');
}
```

- [ ] **步骤 2: 绑定拖动事件到 resizer**

更新 render 方法中的 resizer：
```typescript
<div
    class="resizer"
    @mousedown="${this._handleResizeStart}"
></div>
```

- [ ] **步骤 3: 清理事件监听器（在 disconnectedCallback 中）**

```typescript
override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this._isResizing) {
        document.removeEventListener('mousemove', this._handleResizeMove);
        document.removeEventListener('mouseup', this._handleResizeEnd);
    }
}
```

- [ ] **步骤 4: 测试拖动功能**

```bash
# 在浏览器中测试：
# 1. 鼠标悬停在中间分割线上，应显示蓝色提示条
# 2. 拖动分割线，左右宽度应平滑调整
# 3. 宽度限制在 20%-80% 之间
```

- [ ] **步骤 5: 提交拖动功能**

```bash
git add packages/viewer/src/listenerViewer/index.ts
git commit -m "feat(fastevent-listeners): 实现拖动调整左右宽度功能"
```

---

## Chunk 6: FastEventViewer 集成

### Task 6: 在 FastEventViewer 中添加模式切换

**文件:**
- 修改: `packages/viewer/src/eventViewer/index.ts`
- 修改: `packages/viewer/src/eventViewer/styles.ts`

- [ ] **步骤 1: 在 FastEventViewer 中添加状态**

```typescript
// 在 @state 区域添加
@state()
private _showListeners = false;
```

- [ ] **步骤 2: 修改 renderHeader 方法**

找到监听器按钮，修改点击处理：
```typescript
${this.renderButton(
    "",
    () => {
        this._showListeners = !this._showListeners;
    },
    {
        icon: "listeners",
        className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
        title: "查看所有注册的监听器",
    }
)}
```

- [ ] **步骤 3: 修改 render 方法实现条件渲染**

```typescript
render() {
    return html`
        ${this.renderHeader()}
        ${this._showListeners
            ? html`<fastevent-listeners
                    .emitter="${this.emitter}"
                    ?dark="${this.dark}">
                </fastevent-listeners>`
            : html`${this.renderToolbar()}${this.renderLogs()}`
        }
    `;
}
```

- [ ] **步骤 4: 在 styles.ts 中添加 btn-pressed 样式**

```css
.btn-pressed {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
}
```

- [ ] **步骤 5: 确保导入 fastevent-listeners 组件**

在 eventViewer/index.ts 顶部添加：
```typescript
import "fastevent-listeners";  // 注册自定义元素
```

或者在包的入口文件导出（如果需要）。

- [ ] **步骤 6: 测试模式切换**

```bash
# 在浏览器中测试：
# 1. 打开 fastevent-viewer
# 2. 点击监听器按钮，应切换到监听器视图
# 3. 再次点击，应切换回日志视图
# 4. 检查按钮的按下状态样式
```

- [ ] **步骤 7: 提交集成功能**

```bash
git add packages/viewer/src/eventViewer/
git commit -m "feat(event-viewer): 添加监听器视图模式切换"
```

---

## Chunk 7: 移动端适配和可访问性

### Task 7: 添加移动端响应式设计和可访问性支持

**文件:**
- 修改: `packages/viewer/src/listenerViewer/styles.ts`
- 修改: `packages/viewer/src/listenerViewer/index.ts`

- [ ] **步骤 1: 添加移动端媒体查询**

在 styles.ts 末尾添加：
```css
@media (max-width: 768px) {
    .main-container {
        flex-direction: column;
    }

    .tree-panel {
        flex: 0 0 40%;
        border-right: none;
        border-bottom: 1px solid var(--fe-color-border, #e8e8e8);
    }

    .resizer {
        display: none;
    }
}
```

- [ ] **步骤 2: 添加键盘导航支持**

```typescript
private _handleKeyDown(event: KeyboardEvent, node: TreeNode): void {
    switch (event.key) {
        case 'Enter':
        case ' ':
            event.preventDefault();
            this._handleNodeSelect(node.path);
            break;
        case 'ArrowRight':
            event.preventDefault();
            if (!this._expandedNodes.has(node.path.join('/'))) {
                this._handleNodeToggle(node.path);
            }
            break;
        case 'ArrowLeft':
            event.preventDefault();
            if (this._expandedNodes.has(node.path.join('/'))) {
                this._handleNodeToggle(node.path);
            }
            break;
    }
}
```

- [ ] **步骤 3: 更新 renderTreeNode 添加 ARIA 属性和键盘事件**

```typescript
private renderTreeNode(node: TreeNode): ReturnType<typeof html> {
    const pathKey = node.path.join('/');
    const isExpanded = this._expandedNodes.has(pathKey);
    const isSelected = JSON.stringify(this._selectedPath) === JSON.stringify(node.path);
    const hasChildren = node.children.length > 0;

    return html`
        <div>
            <div
                class="tree-node ${isSelected ? 'selected' : ''}"
                style="padding-left: ${node.depth * 16 + 8}px"
                role="treeitem"
                aria-expanded="${hasChildren ? isExpanded : false}"
                aria-selected="${isSelected}"
                tabindex="${isSelected ? '0' : '-1'}"
                @keydown="${(e: KeyboardEvent) => this._handleKeyDown(e, node)}"
            >
                <!-- 其余内容保持不变 -->
            </div>
            <!-- ... -->
        </div>
    `;
}
```

- [ ] **步骤 4: 为树容器添加 role**

```typescript
private renderTree(): ReturnType<typeof html> {
    if (this._treeData.length === 0) {
        return html`
            <div class="empty-state">
                <span class="icon listeners"></span>
                <p>暂无注册的监听器</p>
            </div>
        `;
    }

    return html`
        <div class="tree-panel" role="tree">
            ${this._treeData.map(node => this.renderTreeNode(node))}
        </div>
    `;
}
```

- [ ] **步骤 5: 提交移动端和可访问性功能**

```bash
git add packages/viewer/src/listenerViewer/
git commit -m "feat(fastevent-listeners): 添加移动端适配和可访问性支持"
```

---

## Chunk 8: 测试和文档

### Task 8: 添加单元测试和使用文档

**文件:**
- 创建: `packages/viewer/src/listenerViewer/__tests__/FastEventListeners.test.ts`
- 创建: `packages/viewer/src/listenerViewer/readme.md`

- [ ] **步骤 1: 创建基础测试文件**

```typescript
// packages/viewer/src/listenerViewer/__tests__/FastEventListeners.test.ts
import { describe, it, expect, beforeEach } from "bun:test";
import { FastEvent } from "fastevent";
import "../index";

describe("FastEventListeners", () => {
    let container: HTMLElement;
    let element: FastEventListeners & HTMLElement;
    let emitter: FastEvent;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);

        emitter = new FastEvent();
        element = document.createElement("fastevent-listeners") as FastEventListeners & HTMLElement;
        element.emitter = emitter;
        container.appendChild(element);
    });

    it("应该渲染组件", () => {
        expect(element).toBeDefined();
        expect(element.shadowRoot).toBeDefined();
    });

    it("应该显示工具栏", () => {
        const toolbar = element.shadowRoot?.querySelector(".toolbar");
        expect(toolbar).toBeDefined();
        const title = toolbar?.querySelector(".toolbar-title");
        expect(title?.textContent).toBe("已注册监听器");
    });

    it("应该构建树数据", () => {
        emitter.on("test/event", () => {});
        element.requestUpdate();

        // 等待更新
        return new Promise(resolve => {
            setTimeout(() => {
                const treePanel = element.shadowRoot?.querySelector(".tree-panel");
                expect(treePanel).toBeDefined();
                resolve(undefined);
            }, 100);
        });
    });

    it("应该支持刷新", () => {
        const refreshButton = element.shadowRoot?.querySelector(".toolbar .btn");
        expect(refreshButton).toBeDefined();

        refreshButton?.dispatchEvent(new Event("click"));

        // 验证刷新逻辑
        expect(element._treeData).toBeDefined();
    });
});
```

- [ ] **步骤 2: 创建使用文档**

```markdown
# FastEventListeners 组件

用于可视化和浏览 FastEvent 实例中所有已注册的监听器。

## 使用方法

### 基础用法

\`\`\`html
<fastevent-listeners id="listeners"></fastevent-listeners>

<script type="module">
    import { FastEvent } from 'fastevent';

    const emitter = new FastEvent();
    document.getElementById('listeners').emitter = emitter;

    // 添加监听器
    emitter.on('user/login', (data) => {
        console.log('User logged in:', data);
    });
</script>
\`\`\`

### 属性

- \`emitter\`: FastEvent 实例
- \`dark\`: 暗色模式（默认 false）

### 功能

- **树形浏览**: 左侧显示事件层级结构
- **监听器详情**: 右侧显示选中节点的监听器列表
- **交互操作**:
  - 点击箭头展开/折叠节点
  - 点击节点文本选中节点
  - 点击函数名在控制台输出监听器信息
  - 拖动分割线调整左右宽度
- **刷新**: 点击刷新按钮重新加载数据
```

- [ ] **步骤 3: 运行测试**

```bash
cd packages/viewer && bun test
```

- [ ] **步骤 4: 构建验证**

```bash
cd packages/viewer && bun run build
```

- [ ] **步骤 5: 提交测试和文档**

```bash
git add packages/viewer/src/listenerViewer/
git commit -m "test(fastevent-listeners): 添加单元测试和使用文档"
```

---

## Chunk 9: 最终验收

### Task 9: 执行完整验收测试

- [ ] **验收 1: 树形结构正确显示所有事件路径**

手动测试：
```javascript
const emitter = new FastEvent();
emitter.on('user/login', () => {});
emitter.on('user/logout', () => {});
emitter.on('admin/settings/update', () => {});

document.querySelector('fastevent-listeners').emitter = emitter;
```
预期：显示树结构，user 和 admin 为顶级节点

- [ ] **验收 2: 点击节点正确显示监听器列表**

点击 user/login 节点，右侧应显示 1 个监听器

- [ ] **验收 3: 拖动调整宽度（20%-80%）**

拖动中间分割线，宽度应平滑调整，限制在范围内

- [ ] **验收 4: 刷新按钮重新加载数据**

添加新监听器后点击刷新，树应更新

- [ ] **验收 5: 点击函数名控制台输出**

点击监听器函数名，浏览器控制台应输出函数信息

- [ ] **验收 6: 滚动条样式**

鼠标移入面板，滚动条显示，宽度 2px

- [ ] **验收 7: 默认状态**

所有节点默认展开，默认宽度比例 1:2

- [ ] **验收 8: 暗色模式**

设置 \`dark="true"\`，样式应正确切换

- [ ] **验收 9: FastEventViewer 集成**

在 fastevent-viewer 中点击监听器按钮，应切换视图

- [ ] **验收 10: 展开/折叠和选择分离**

点击箭头切换展开状态，点击文本选择节点

- [ ] **验收 11: WeakRef 处理**

模拟函数丢失场景，应显示警告而非报错

- [ ] **验收 12: TypeScript 编译**

\`\`\`bash
bun run build
\`\`\`
预期：无错误

- [ ] **验收 13: 单元测试覆盖率**

\`\`\`bash
bun run test:coverage
\`\`\`
预期：覆盖率 ≥ 80%

- [ ] **最终提交**

\`\`\`bash
git add .
git commit -m "feat(fastevent-listeners): 完成实现并通过所有验收测试"
\`\`\`

---

## 实施注意事项

1. **TDD 原则**: 每个功能先写测试，再实现代码
2. **频繁提交**: 每完成一个 Task 立即提交
3. **DRY**: 渲染辅助方法（renderTag、renderIcon）保持简洁
4. **YAGNI**: 不实现虚拟滚动、localStorage 等未来功能
5. **类型安全**: 确保 TypeScript 编译无错误
6. **代码注释**: 所有代码注释使用中文

## 故障排查

### 问题：树节点不显示
检查：emitter.listeners 是否正确传递，_buildTreeData 是否返回数据

### 问题：拖动不生效
检查：事件监听器是否正确绑定到 document

### 问题：样式不生效
检查：CSS 变量是否正确设置，icons.css 是否导入

## 参考资料

- 设计文档：`docs/superpowers/specs/2026-03-19-fastevent-listeners-design.md`
- Lit 文档：https://lit.dev/
- FastEvent 类型：`packages/native/src/types/FastEventListeners.ts`
- 参考组件：`packages/viewer/src/eventViewer/index.ts`
