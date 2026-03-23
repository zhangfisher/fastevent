# Multi-Emitter Support Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 fastevent-viewer 组件添加支持多个 FastEvent emitter 的功能，支持下拉菜单切换，并为每个 emitter 独立保存日志历史。

**Architecture:** 使用内部状态管理，通过 Map 数据结构为每个 emitter 独立存储日志。修改 emitter 属性为 getter/setter 以支持数组和单个实例。添加下拉菜单 UI 组件，使用 Lit 的响应式状态管理菜单开关状态。

**Tech Stack:** TypeScript, Lit (Web Components), CSS (with CSS variables for dark mode)

---

## Chunk 1: 创建 renderMenu 工具函数

### Task 1: 创建 renderMenu.ts 工具文件

**Files:**
- Create: `packages/viewer/src/utils/renderMenu.ts`
- Modify: `packages/viewer/src/utils/index.ts`

- [ ] **Step 1: 创建 renderMenu.ts 文件和接口定义**

```typescript
// packages/viewer/src/utils/renderMenu.ts
import { html, TemplateResult } from "lit";

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
```

运行: `touch packages/viewer/src/utils/renderMenu.ts`

- [ ] **Step 2: 在 utils/index.ts 中导出 renderMenu**

```typescript
// packages/viewer/src/utils/index.ts
export * from "./removeItem";
export * from "./renderTag";
export * from "./renderButton";
export * from "./renderIcon";
export * from "./renderRetainMessage";
export * from "./t";
export * from "./renderMenu";
```

运行: 编辑文件，在末尾添加 `export * from "./renderMenu";`

- [ ] **Step 3: 提交工具函数**

```bash
git add packages/viewer/src/utils/renderMenu.ts packages/viewer/src/utils/index.ts
git commit -m "feat(viewer): add renderMenu utility function

- Add MenuItem and MenuOptions interfaces
- Implement renderMenu function for dropdown menus
- Export from utils/index"
```

---

## Chunk 2: 添加 CSS 样式

### Task 2: 在 styles.ts 中添加下拉菜单样式

**Files:**
- Modify: `packages/viewer/src/eventViewer/styles.ts`

- [ ] **Step 1: 添加下拉容器、触发按钮和箭头样式**

在 `styles.ts` 的 `.empty-state .icon` 样式后添加：

```css
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
```

运行: 编辑 `packages/viewer/src/eventViewer/styles.ts`，在文件末尾 `}` 之前添加上述样式

- [ ] **Step 2: 添加下拉菜单和菜单项样式**

继续添加：

```css
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
```

运行: 继续在 `styles.ts` 中添加上述样式

- [ ] **Step 3: 添加暗黑模式样式**

在暗黑模式部分（`:host([dark])` 部分）添加：

```css
/* 暗黑模式适配 */
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
```

运行: 在 `styles.ts` 的 `:host([dark])` 部分添加上述样式（约在第 260 行附近）

- [ ] **Step 4: 添加通用下拉菜单样式**

继续添加通用样式供 renderMenu 使用：

```css
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

:host([dark]) .dropdown-menu {
    background: var(--fe-color-bg, #2a2a2a);
    border-color: var(--fe-color-border, #404040);
}

:host([dark]) .dropdown-menu-item.active {
    background: rgba(24, 144, 255, 0.15);
    color: #40a9ff;
}
```

运行: 在 `styles.ts` 末尾添加上述样式

- [ ] **Step 5: 提交样式更改**

```bash
git add packages/viewer/src/eventViewer/styles.ts
git commit -m "feat(viewer): add dropdown menu styles

- Add emitter dropdown container styles
- Add trigger button and arrow styles
- Add menu and menu item styles
- Add dark mode support
- Add animation for dropdown fade-in
- Add generic dropdown menu styles for renderMenu"
```

---

## Chunk 3: 修改 FastEventViewer 组件核心逻辑

### Task 3: 添加状态和属性 getter/setter

**Files:**
- Modify: `packages/viewer/src/eventViewer/index.ts`

- [ ] **Step 1: 添加私有状态属性**

在类的属性声明部分（约第 24-60 行），添加新的状态：

```typescript
@state()
private _emitters: FastEvent[] = [];

@state()
private _currentEmitterIndex = 0;

@state()
private _isDropdownOpen = false;

private _emitterLogs = new Map<number, EventLog[]>();
private _emitterLogIndexes = new Map<number, number[]>();
```

运行: 编辑 `packages/viewer/src/eventViewer/index.ts`，在 `subscriber?: FastEventSubscriber;` 声明后添加上述代码

- [ ] **Step 2: 将 emitter 属性改为 getter/setter**

修改原有的 `@property({ type: Object }) emitter?: FastEvent;`（约第 24-25 行）：

```typescript
@property({ type: Object })
get emitter(): FastEvent | FastEvent[] | undefined {
    return this._emitters.length === 1 ? this._emitters[0] : this._emitters;
}

set emitter(value: FastEvent | FastEvent[] | undefined) {
    this._emitters = Array.isArray(value) ? value : value ? [value] : [];
    if (this._currentEmitterIndex >= this._emitters.length) {
        this._currentEmitterIndex = 0;
    }
    this._reattach();
}
```

运行: 替换原有的 emitter 属性声明

- [ ] **Step 3: 添加 _getCurrentEmitter 辅助方法**

在类的私有方法部分添加：

```typescript
private _getCurrentEmitter(): FastEvent | undefined {
    return this._emitters[this._currentEmitterIndex];
}
```

运行: 在 `_reattach()` 方法之前添加此方法

- [ ] **Step 4: 提交属性修改**

```bash
git add packages/viewer/src/eventViewer/index.ts
git commit -m "feat(viewer): add multi-emitter state management

- Add _emitters, _currentEmitterIndex, _isDropdownOpen state
- Add _emitterLogs and _emitterLogIndexes Maps for log storage
- Convert emitter property to getter/setter
- Add _getCurrentEmitter() helper method"
```

---

## Chunk 4: 更新所有 emitter 引用

### Task 4: 替换组件中所有 this.emitter 为 _getCurrentEmitter()

**Files:**
- Modify: `packages/viewer/src/eventViewer/index.ts`

- [ ] **Step 1: 修改 _attach 方法**

找到 `_attach()` 方法（约第 223 行），替换所有 `this.emitter`：

```typescript
private _attach() {
    const currentEmitter = this._getCurrentEmitter();
    if (currentEmitter) {
        const options = currentEmitter.options;
        currentEmitter.hooks.BeforeExecuteListener.push(this._onBeforeExecuteListener);
        currentEmitter.hooks.AfterExecuteListener.push(this._onAfterExecuteListener);
        options.debug = true;
    }
}
```

运行: 编辑 `_attach()` 方法

- [ ] **Step 2: 修改 _detach 方法**

找到 `_detach()` 方法（约第 232 行），替换所有 `this.emitter`：

```typescript
private _detach() {
    const currentEmitter = this._getCurrentEmitter();
    if (currentEmitter) {
        removeItem(currentEmitter.hooks.BeforeExecuteListener, this._onBeforeExecuteListener);
        removeItem(currentEmitter.hooks.AfterExecuteListener, this._onAfterExecuteListener);
        const options = currentEmitter.options;
        options.debug = false;
    }
}
```

运行: 编辑 `_detach()` 方法

- [ ] **Step 3: 修改 _onBeforeExecuteListener 方法**

找到 `_onBeforeExecuteListener` 方法（约第 116 行），替换第一行：

```typescript
_onBeforeExecuteListener = (message: FastEventMessage, args: FastEventListenerArgs) => {
    const currentEmitter = this._getCurrentEmitter();
    if (!currentEmitter || !this.enable) return;

    const listeners = (currentEmitter.getListeners(message.type) || []).map((meta) => {
        return this._getListenerMeta(meta, "running");
    });
    // ... 其余代码保持不变
```

运行: 编辑 `_onBeforeExecuteListener` 方法开头

- [ ] **Step 4: 提交引用修改**

```bash
git add packages/viewer/src/eventViewer/index.ts
git commit -m "refactor(viewer): replace this.emitter with _getCurrentEmitter

- Update _attach() to use _getCurrentEmitter()
- Update _detach() to use _getCurrentEmitter()
- Update _onBeforeExecuteListener to use _getCurrentEmitter()"
```

---

## Chunk 5: 实现 Emitter 切换逻辑

### Task 5: 添加 _switchEmitter 方法

**Files:**
- Modify: `packages/viewer/src/eventViewer/index.ts`

- [ ] **Step 1: 实现 _switchEmitter 方法**

在私有方法区域添加切换逻辑：

```typescript
private _switchEmitter(index: number) {
    if (index === this._currentEmitterIndex) return;

    // 保存当前 emitter 的日志
    this._emitterLogs.set(this._currentEmitterIndex, [...this.logs]);
    this._emitterLogIndexes.set(this._currentEmitterIndex, [...this._logIndexs]);

    // 切换到新 emitter
    this._currentEmitterIndex = index;

    // 恢复新 emitter 的日志
    this.logs = this._emitterLogs.get(index) || [];
    this._logIndexs = this._emitterLogIndexes.get(index) || [];

    // 重新附加钩子
    this._reattach();

    // 关闭下拉菜单
    this._isDropdownOpen = false;

    this.requestUpdate();
}
```

运行: 在 `_getCurrentEmitter()` 方法后添加此方法

- [ ] **Step 2: 提交切换逻辑**

```bash
git add packages/viewer/src/eventViewer/index.ts
git commit -m "feat(viewer): add emitter switching logic

- Implement _switchEmitter() method
- Save current emitter logs before switching
- Restore logs for new emitter
- Reattach hooks for new emitter
- Close dropdown after switching"
```

---

## Chunk 6: 实现 UI 渲染方法

### Task 6: 添加下拉菜单渲染方法

**Files:**
- Modify: `packages/viewer/src/eventViewer/index.ts`

- [ ] **Step 1: 添加 _renderEmitterDropdown 方法**

在 render 方法区域添加：

```typescript
private _renderEmitterDropdown(title: string) {
    return html`
        <div class="emitter-dropdown-container">
            <button
                class="emitter-dropdown-trigger"
                @click="${() => this._isDropdownOpen = !this._isDropdownOpen}"
                title="${t("eventViewer.switchEmitter")}"
            >
                <span class="header-title">${title}</span>
                <span class="dropdown-arrow ${this._isDropdownOpen ? 'open' : ''}"></span>
            </button>
            ${this._isDropdownOpen ? this._renderEmitterMenu() : ''}
        </div>
    `;
}
```

运行: 在 `renderHeader()` 方法之前添加此方法

- [ ] **Step 2: 添加 _renderEmitterMenu 方法**

```typescript
private _renderEmitterMenu() {
    return html`
        <div class="emitter-dropdown-menu">
            ${this._emitters.map((emitter, index) => {
                const isActive = index === this._currentEmitterIndex;
                const menuTitle = this.title.length > 0 ? this.title : emitter?.title || `Emitter ${index + 1}`;
                return html`
                    <div
                        class="emitter-menu-item ${isActive ? 'active' : ''}"
                        @click="${() => this._switchEmitter(index)}"
                    >
                        ${isActive ? renderIcon("yes") : ''}
                        <span>${menuTitle}</span>
                    </div>
                `;
            })}
        </div>
    `;
}
```

运行: 在 `_renderEmitterDropdown()` 方法后添加此方法

- [ ] **Step 3: 修改 renderHeader 方法**

找到 `renderHeader()` 方法（约第 283 行），替换整个方法：

```typescript
renderHeader() {
    const hasMultipleEmitters = this._emitters.length > 1;
    const currentEmitter = this._getCurrentEmitter();
    const displayTitle = this.title.length > 0 ? this.title : currentEmitter?.title || "";

    return html`
        <div class="header">
            ${hasMultipleEmitters
                ? this._renderEmitterDropdown(displayTitle)
                : html`<span class="header-title">${displayTitle}</span>`
            }
            ${renderButton("", () => { this.dark = !this.dark; }, {
                icon: "dark",
                className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
                title: this.dark ? t("eventViewer.normalMode") : t("eventViewer.darkMode"),
            })}
            ${renderButton("", () => { this._showListeners = !this._showListeners; }, {
                icon: "listeners",
                className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
                title: this._showListeners
                    ? t("eventViewer.showEvent")
                    : t("eventViewer.showListeners"),
            })}
        </div>
    `;
}
```

运行: 替换 `renderHeader()` 方法的全部内容

- [ ] **Step 4: 添加国际化文本**

检查并确保在 `packages/viewer/src/utils/languages.ts` 中添加：

```typescript
switchEmitter: {
    cn: "切换 Emitter",
    en: "Switch Emitter",
}
```

运行: 编辑 `languages.ts` 文件，添加上述翻译

- [ ] **Step 5: 提交 UI 渲染方法**

```bash
git add packages/viewer/src/eventViewer/index.ts packages/viewer/src/utils/languages.ts
git commit -m "feat(viewer): add dropdown menu UI rendering

- Add _renderEmitterDropdown() method
- Add _renderEmitterMenu() method
- Update renderHeader() to support multiple emitters
- Add internationalization for 'switchEmitter'"
```

---

## Chunk 7: 添加全局点击处理

### Task 7: 实现点击外部关闭菜单

**Files:**
- Modify: `packages/viewer/src/eventViewer/index.ts`

- [ ] **Step 1: 添加 _handleDocumentClick 方法**

在私有方法区域添加：

```typescript
private _handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const dropdown = this.renderRoot?.querySelector('.emitter-dropdown-container');
    if (dropdown && !dropdown.contains(target)) {
        this._isDropdownOpen = false;
        this.requestUpdate();
    }
};
```

运行: 在 `_switchEmitter()` 方法后添加此方法

- [ ] **Step 2: 修改 connectedCallback**

找到 `connectedCallback()` 方法（约第 66 行），添加事件监听器：

```typescript
connectedCallback(): void {
    super.connectedCallback();
    setLanguage(this.lang);
    this._attach();
    document.addEventListener('click', this._handleDocumentClick);
}
```

运行: 编辑 `connectedCallback()` 方法，在 `this._attach()` 后添加事件监听器

- [ ] **Step 3: 修改 disconnectedCallback**

找到 `disconnectedCallback()` 方法（约第 72 行），移除事件监听器：

```typescript
disconnectedCallback(): void {
    this._detach();
    document.removeEventListener('click', this._handleDocumentClick);
}
```

运行: 编辑 `disconnectedCallback()` 方法，在 `this._detach()` 后添加事件移除

- [ ] **Step 4: 提交事件处理**

```bash
git add packages/viewer/src/eventViewer/index.ts
git commit -m "feat(viewer): add click outside to close dropdown

- Add _handleDocumentClick method
- Add global click listener in connectedCallback
- Remove listener in disconnectedCallback"
```

---

## Chunk 8: 创建示例代码

### Task 8: 添加多个 Emitter 实例

**Files:**
- Modify: `packages/viewer/example/index.ts`

- [ ] **Step 1: 在 example/index.ts 末尾添加多个 emitter**

在文件末尾（第 352 行后）添加：

```typescript
// ==================== 创建多个 Emitter 用于测试 ====================

/**
 * Emitter 1: 用户相关事件
 */
const userEmitter = new FastEvent({
    debug: true,
    title: "用户事件",
});

userEmitter.on("user/login", (data: any) => {
    console.log("[用户事件] 登录:", data);
    return { success: true, userId: data.userId };
});

userEmitter.on("user/logout", (data: any) => {
    console.log("[用户事件] 登出:", data);
    return { loggedOut: true };
});

/**
 * Emitter 2: 数据相关事件
 */
const dataEmitter = new FastEvent({
    debug: true,
    title: "数据事件",
});

dataEmitter.on("data/fetch", (data: any) => {
    console.log("[数据事件] 获取:", data);
    return { items: [1, 2, 3, 4, 5], total: 5 };
});

dataEmitter.on("data/update", (data: any) => {
    console.log("[数据事件] 更新:", data);
    return { updated: true };
});

/**
 * Emitter 3: 系统相关事件
 */
const systemEmitter = new FastEvent({
    debug: true,
    title: "系统事件",
});

systemEmitter.on("system/start", () => {
    console.log("[系统事件] 启动");
    return { status: "running", uptime: 0 };
});

systemEmitter.on("system/stop", () => {
    console.log("[系统事件] 停止");
    return { status: "stopped" };
});

// 挂载到全局，方便调试
globalThis.userEmitter = userEmitter;
globalThis.dataEmitter = dataEmitter;
globalThis.systemEmitter = systemEmitter;

/**
 * 导出多个 emitter 供组件使用
 */
export const multipleEmitters = [emitter, userEmitter, dataEmitter, systemEmitter];

// ==================== 触发函数 ====================

/**
 * 触发用户事件
 */
export function triggerUserEvents() {
    userEmitter.emit("user/login", { userId: 123, username: "testuser" }, true);
    setTimeout(() => {
        userEmitter.emit("user/logout", { userId: 123 });
    }, 500);
}

/**
 * 触发数据事件
 */
export function triggerDataEvents() {
    dataEmitter.emit("data/fetch", { page: 1, limit: 10 });
    setTimeout(() => {
        dataEmitter.emit("data/update", { id: 1, changes: { status: "active" } });
    }, 300);
}

/**
 * 触发系统事件
 */
export function triggerSystemEvents() {
    systemEmitter.emit("system/start");
    setTimeout(() => {
        systemEmitter.emit("system/stop");
    }, 400);
}
```

运行: 在 `packages/viewer/example/index.ts` 文件末尾添加上述代码

- [ ] **Step 2: 更新全局类型声明**

在文件的 `declare global` 部分（约第 350 行）添加：

```typescript
declare global {
    var emitter: FastEvent;
    var userEmitter: FastEvent;
    var dataEmitter: FastEvent;
    var systemEmitter: FastEvent;
}
```

运行: 编辑全局类型声明

- [ ] **Step 3: 提交示例代码**

```bash
git add packages/viewer/example/index.ts
git commit -m "feat(viewer): add multiple emitter examples

- Add userEmitter for user-related events
- Add dataEmitter for data-related events
- Add systemEmitter for system-related events
- Export multipleEmitters array
- Add trigger functions for each emitter type
- Update global type declarations"
```

---

## Chunk 9: 更新示例 HTML

### Task 9: 在 HTML 中添加多 Emitter 示例

**Files:**
- Modify: `packages/viewer/example/index.html`

- [ ] **Step 1: 读取现有 HTML 文件**

首先查看现有 HTML 结构：

运行: `cat packages/viewer/example/index.html`

- [ ] **Step 2: 添加多 Emitter viewer 示例**

在现有的 `<fastevent-viewer>` 后添加：

```html
<!-- 多个 Emitter 示例 -->
<h2>多个 Emitter 示例</h2>
<fastevent-viewer
    id="viewer2"
    .emitter="${multipleEmitters}"
    lang="cn"
    max-size="500"
></fastevent-viewer>

<div class="test-buttons">
    <h3>测试按钮</h3>
    <button @click="${triggerUserEvents}">触发用户事件</button>
    <button @click="${triggerDataEvents}">触发数据事件</button>
    <button @click="${triggerSystemEvents}">触发系统事件</button>
</div>
```

同时需要在 script 标签中导入新的函数：

```javascript
import {
    emitter,
    multipleEmitters,
    triggerSimpleEvent,
    triggerTaggedEvent,
    triggerTransformEvent,
    triggerErrorEvent,
    triggerMultiListenerEvent,
    triggerCountedEvent,
    triggerBatchEvents,
    triggerWildcardEvents,
    triggerAsyncEvent,
    triggerLongRunningEvent,
    startRandomEvents,
    stopRandomEvents,
    triggerUserEvents,
    triggerDataEvents,
    triggerSystemEvents,
} from "./index.ts";
```

运行: 编辑 `packages/viewer/example/index.html`

- [ ] **Step 3: 添加样式**

在 HTML 的 style 标签中添加测试按钮样式：

```css
.test-buttons {
    margin: 20px 0;
    padding: 15px;
    background: #f5f5f5;
    border-radius: 6px;
}

.test-buttons h3 {
    margin-top: 0;
    margin-bottom: 10px;
}

.test-buttons button {
    margin-right: 10px;
    margin-bottom: 10px;
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    transition: all 0.3s;
}

.test-buttons button:hover {
    border-color: #1890ff;
    color: #1890ff;
}
```

运行: 在 HTML 的 style 标签中添加上述样式

- [ ] **Step 4: 提交 HTML 更改**

```bash
git add packages/viewer/example/index.html
git commit -m "feat(viewer): add multi-emitter example in HTML

- Add second viewer with multiple emitters
- Add test buttons for each emitter type
- Import new trigger functions
- Add styles for test buttons"
```

---

## Chunk 10: 构建和测试

### Task 10: 验证构建和功能测试

**Files:**
- Build: `packages/viewer`
- Test: Manual testing in browser

- [ ] **Step 1: 构建 viewer 包**

```bash
cd packages/viewer
bun run build
```

预期: 构建成功，无错误

运行: 执行构建命令

- [ ] **Step 2: 启动示例开发服务器**

```bash
cd packages/viewer
bun run docs:dev
```

预期: 开发服务器启动，显示访问 URL

运行: 启动开发服务器

- [ ] **Step 3: 手动功能测试 - 单个 emitter 向后兼容**

1. 打开浏览器访问示例页面
2. 查看第一个 viewer（单个 emitter）
3. 验证：无下拉箭头显示
4. 验证：标题正常显示
5. 触发一些事件，验证功能正常

预期: 单个 emitter 行为与之前完全一致

运行: 在浏览器中测试

- [ ] **Step 4: 手动功能测试 - 多个 emitter 基础功能**

1. 查看第二个 viewer（多个 emitter）
2. 验证：标题右侧显示下拉箭头
3. 点击标题区域
4. 验证：下拉菜单打开，显示 4 个 emitter
5. 验证：当前选中的 emitter 有勾选图标和蓝色背景

预期: 下拉菜单正确显示所有 emitter

运行: 在浏览器中测试

- [ ] **Step 5: 手动功能测试 - Emitter 切换**

1. 在当前 emitter 触发一些事件（使用原测试按钮）
2. 点击菜单切换到第二个 emitter
3. 触发用户事件（点击"触发用户事件"按钮）
4. 切换回第一个 emitter
5. 验证：日志显示之前的事件，没有用户事件
6. 再次切换到第二个 emitter
7. 验证：日志显示用户事件

预期: 每个 emitter 的日志独立保存

运行: 在浏览器中测试

- [ ] **Step 6: 手动功能测试 - 外部点击关闭**

1. 打开下拉菜单
2. 点击页面其他区域（不是菜单）
3. 验证：菜单关闭

预期: 点击外部区域菜单关闭

运行: 在浏览器中测试

- [ ] **Step 7: 手动功能测试 - 暗黑模式**

1. 点击暗黑模式切换按钮
2. 验证：下拉菜单样式正确应用暗黑主题
3. 打开下拉菜单
4. 验证：菜单背景为暗色，文字颜色适配

预期: 暗黑模式样式正确

运行: 在浏览器中测试

- [ ] **Step 8: 边界测试**

1. 快速连续切换 emitter
2. 验证：无错误，日志正确
3. 重复点击同一个 emitter
4. 验证：无重复切换，菜单关闭

预期: 边界情况处理正确

运行: 在浏览器中测试

- [ ] **Step 9: 检查控制台错误**

打开浏览器开发者工具，检查：
- 无 TypeScript 类型错误
- 无运行时错误
- 无警告信息

预期: 控制台无错误

运行: 检查浏览器控制台

- [ ] **Step 10: 提交完成标记**

如果所有测试通过：

```bash
git commit --allow-empty -m "test(viewer): complete multi-emitter support testing

- Verified backward compatibility with single emitter
- Verified multiple emitter dropdown functionality
- Verified emitter switching with independent logs
- Verified click outside to close dropdown
- Verified dark mode support
- Verified edge cases
- All tests passing"
```

---

## 完成检查清单

在实施完成后，验证以下所有项：

### 代码质量
- [ ] 所有 TypeScript 类型正确
- [ ] 代码风格与现有代码一致
- [ ] 无 console 错误或警告
- [ ] 所有文件有适当的中文注释

### 功能完整性
- [ ] 单个 emitter 向后兼容
- [ ] 多个 emitter 下拉菜单显示
- [ ] Emitter 切换功能正常
- [ ] 日志独立存储和恢复
- [ ] 外部点击关闭菜单
- [ ] 暗黑模式支持

### 用户体验
- [ ] 下拉动画流畅
- [ ] Hover 状态反馈明显
- [ ] 菜单项高亮清晰
- [ ] 选中状态图标显示

### 文档和示例
- [ ] 示例代码可运行
- [ ] 测试按钮功能正常
- [ ] 代码注释清晰

### 性能
- [ ] 切换 emitter 无明显延迟
- [ ] 日志存储高效
- [ ] 无内存泄漏

---

## 故障排查

### 问题：下拉菜单不显示

**检查项：**
1. CSS 样式是否正确加载
2. `z-index` 是否足够高
3. `.emitter-dropdown-menu` 的 `position` 是否为 `absolute`

**解决：**
- 检查 `styles.ts` 中样式是否正确添加
- 使用浏览器开发者工具检查元素样式

### 问题：切换 emitter 后日志不更新

**检查项：**
1. `_switchEmitter` 方法是否被调用
2. Map 中是否保存了日志
3. `this.requestUpdate()` 是否被调用

**解决：**
- 在 `_switchEmitter` 中添加 console.log 调试
- 检查 `_emitterLogs` Map 的内容

### 问题：点击外部不关闭菜单

**检查项：**
1. 事件监听器是否添加
2. `renderRoot?.querySelector` 是否找到元素
3. `contains()` 方法是否正确

**解决：**
- 检查 `connectedCallback` 和 `disconnectedCallback`
- 在 `_handleDocumentClick` 中添加调试日志

### 问题：暗黑模式样式不生效

**检查项：**
1. `:host([dark])` 选择器是否正确
2. CSS 变量是否定义
3. 样式优先级是否正确

**解决：**
- 使用浏览器开发者工具检查样式覆盖
- 增加 `!important` 如果需要（不推荐）

---

## 额外资源

### 相关文档
- Lit 生命周期: https://lit.dev/docs/components/lifecycle/
- Lit 响应式状态: https://lit.dev/docs/components/properties/
- TypeScript 类型守卫: https://www.typescriptlang.org/docs/handbook/2/narrowing.html

### 现有代码参考
- `renderButton.ts`: 按钮渲染模式
- `renderIcon.ts`: 图标使用方式
- 现有事件监听器管理代码

### 测试技巧
- 使用浏览器开发者工具的 Elements 面板检查 DOM 结构
- 使用 Console 面板查看运行时日志
- 使用 Network 面板检查资源加载
- 使用 Performance 面板检查渲染性能
