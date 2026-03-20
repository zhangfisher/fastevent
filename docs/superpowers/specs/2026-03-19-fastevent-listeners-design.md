# FastEventListeners 组件设计文档

**日期**: 2026-03-19
**组件名称**: fastevent-listeners
**设计者**: Claude Code
**状态**: 已批准

## 1. 概述

FastEventListeners 是一个用于可视化和浏览 FastEvent 实例中所有已注册监听器的 Web Component。它提供树形结构展示事件层级，并支持查看每个事件节点的详细监听器信息。

### 1.1 目标

- 提供清晰的监听器树形浏览界面
- 显示每个监听器的详细信息（函数名、执行次数、标签等）
- 支持交互式查看和调试监听器
- 与现有 FastEventViewer 组件无缝集成

### 1.2 技术栈

- **框架**: Lit (Web Components)
- **语言**: TypeScript
- **样式**: CSS (Lit css 标签函数)
- **图标**: SVG mask-image (从 icons.css 读取)

## 2. 架构设计

### 2.1 组件结构

```
packages/viewer/src/
├── eventViewer/
│   ├── index.ts          # FastEventViewer（修改：添加模式切换）
│   └── styles.ts         # 现有样式（保持不变）
└── listenerViewer/
    ├── index.ts          # FastEventListeners（新增完整实现）
    └── styles.ts         # 监听器视图样式（新增）
```

### 2.2 组件关系

```
FastEventViewer (容器)
    ├── 状态: _showListeners
    ├── 视图1: EventLog (日志)
    └── 视图2: FastEventListeners (监听器)
            ├── 属性: emitter, dark
            ├── 树面板 (左)
            └── 监听器面板 (右)
```

### 2.3 设计决策

选择 **方案 A: 独立组件 + 状态控制**，理由：
- 组件职责清晰，易于维护和测试
- FastEventListeners 可独立复用
- 符合 Lit 组件设计最佳实践
- 代码结构清晰，易于扩展

## 3. FastEventListeners 组件设计

### 3.1 组件属性

| 属性 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| `emitter` | `FastEvent` | 否 | `undefined` | 绑定的 FastEvent 实例 |
| `dark` | `boolean` | 否 | `false` | 暗色模式 |

### 3.2 内部状态

| 状态 | 类型 | 描述 |
|------|------|------|
| `_selectedPath` | `string[]` | 当前选中的树节点路径 |
| `_treeData` | `TreeNode[]` | 扁平化的树数据（用于渲染） |
| `_listeners` | `ListenerInfo[]` | 当前选中节点的监听器列表 |
| `_leftWidth` | `string` | 左侧宽度（默认 '33.33%'，即 1:2） |
| `_refreshing` | `boolean` | 刷新状态（用于显示加载动画） |
| `_expandedNodes` | `Set<string>` | 展开的节点集合（路径字符串） |

### 3.3 核心方法

| 方法 | 描述 |
|------|------|
| `_buildTreeData()` | 递归遍历 `emitter.listeners`，构建渲染用的树数据 |
| `_handleNodeSelect(path)` | 处理树节点点击，更新右侧监听器列表 |
| `_handleRefresh()` | 刷新数据（重新构建树） |
| `_handleResize(event)` | 处理拖动调整宽度 |
| `_formatListenerCount(meta)` | 格式化执行次数显示（如 "5/10"） |
| `_printListenerToConsole(fn)` | 在控制台输出监听器函数源码 |

### 3.4 渲染方法

| 方法 | 描述 |
|------|------|
| `renderToolbar()` | 工具栏（标题 + 刷新按钮） |
| `renderTree()` | 左侧树形结构 |
| `renderTreeNode()` | 递归渲染树节点 |
| `renderListeners()` | 右侧监听器列表 |
| `renderListener()` | 单个监听器卡片 |
| `renderResizer()` | 中间拖动条 |

### 3.5 辅助方法

| 方法 | 描述 |
|------|------|
| `renderTag(text, color, tooltip)` | 渲染标签组件（复用 eventViewer） |
| `renderButton(content, onClick, options)` | 渲染按钮组件（复用 eventViewer） |
| `renderIcon(name)` | 渲染图标组件（复用 eventViewer） |

## 4. 数据结构设计

### 4.1 TreeNode 接口

```typescript
interface TreeNode {
    key: string                         // 节点键名
    path: string[]                      // 完整路径（如 ['user', 'login']）
    listeners: FastEventListenerMeta[]  // 当前节点的 __listeners
    listenerCount: number               // 监听器数量
    children: TreeNode[]                // 子节点
    depth: number                       // 深度（用于缩进）
}
```

### 4.2 树遍历算法

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

### 4.3 节点选择处理

```typescript
private _handleNodeSelect(path: string[]) {
    this._selectedPath = path;

    // 查找对应的 TreeNode，获取其 listeners
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
}
```

## 5. FastEventViewer 修改设计

### 5.1 新增状态

```typescript
@state()
private _showListeners = false   // 是否显示监听器视图
```

### 5.2 修改的方法

#### renderHeader()

修改监听器按钮点击处理：

```typescript
renderButton(
    "",
    () => {
        this._showListeners = !this._showListeners;
    },
    {
        icon: "listeners",
        className: "btn-icon" + (this._showListeners ? " btn-pressed" : ""),
        title: "查看所有注册的监听器",
    }
)
```

#### render()

添加条件渲染：

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

### 5.3 新增样式

在 `styles.ts` 中添加：

```css
.btn-pressed {
    color: #1890ff;
    background: rgba(24, 144, 255, 0.1);
}
```

## 6. 样式设计

### 6.1 主容器

```css
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

.main-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
}
```

### 6.2 工具栏

```css
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
```

### 6.3 左侧树面板

```css
.tree-panel {
    flex: 0 0 var(--left-width, 33.33%);
    overflow-y: auto;
    overflow-x: hidden;
    border-right: 1px solid var(--fe-color-border, #e8e8e8);
    padding: 8px;
}

/* 滚动条样式 */
.tree-panel::-webkit-scrollbar {
    width: 2px;
}
.tree-panel::-webkit-scrollbar-thumb {
    background: transparent;
}
.tree-panel:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
}
```

### 6.4 树节点

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

### 6.5 右侧监听器面板

```css
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
```

### 6.6 监听器卡片

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

### 6.7 拖动条

```css
.resizer {
    width: 8px;
    cursor: col-resize;
    background: transparent;
    position: relative;
    z-index: 10;
    flex-shrink: 0;
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
    transition: opacity 0.2s;
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
```

### 6.8 空状态

```css
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3em;
    color: var(--fe-color-text-secondary, #999);
    text-align: center;
}

.empty-state .icon {
    --icon-size: 48px;
    margin-bottom: 1em;
    opacity: 0.3;
}
```

## 7. 用户交互流程

### 7.1 初始加载流程

```
1. FastEventListeners 组件挂载
2. willUpdate() 检测 emitter 属性变化
3. 触发 _buildTreeData() 构建树数据
4. 初始化 _expandedNodes，添加所有节点
5. 默认选中第一个有监听器的节点
6. 触发重新渲染
```

### 7.2 点击树节点流程

```
1. 用户点击树节点
2. 触发 _handleNodeSelect(path)
3. 更新 _selectedPath 状态
4. 从 _treeData 中查找对应节点的 listeners
5. 更新 _listeners 状态
6. 触发右侧面板重新渲染
```

### 7.3 点击刷新按钮流程

```
1. 用户点击刷新按钮
2. 设置 _refreshing = true（显示加载动画）
3. 调用 _buildTreeData() 重建树
4. 尝试保持当前选中的节点路径（如果仍存在）
5. 设置 _refreshing = false
6. 触发重新渲染
```

### 7.4 拖动调整宽度流程

```
1. mousedown 在 resizer 上
   - 记录初始鼠标位置
   - 记录容器宽度
   - 添加 document mousemove/mouseup 监听器
   - 设置 dragging 状态

2. mousemove 在 document 上
   - 计算偏移量
   - 计算新宽度百分比
   - 限制在 20%-80% 范围内
   - 更新 _leftWidth

3. mouseup 在 document 上
   - 移除事件监听器
   - 清除 dragging 状态
```

### 7.5 点击函数名称流程

```
1. 用户点击监听器函数名称
2. 触发 _printListenerToConsole(listener)
3. 在浏览器控制台输出：
   - 监听器函数名
   - 函数源码 (fn.toString())
   - 执行元数据（次数、标签等）
```

## 8. 错误处理和边界情况

### 8.1 emitter 为空或未设置

```typescript
private _buildTreeData(): TreeNode[] {
    if (!this.emitter?.listeners) {
        return [];
    }
    // ... 构建树
}

render() {
    return html`
        ${this.renderToolbar()}
        ${this._treeData.length === 0
            ? html`<div class="empty-state">无可用监听器</div>`
            : html`<div class="main-container">...</div>`
        }
    `;
}
```

### 8.2 节点路径不存在（刷新后）

```typescript
private _handleNodeSelect(path: string[]) {
    const node = findNode(this._treeData, path);
    if (node) {
        this._listeners = node.listeners;
    } else {
        // 路径不存在，清空选择
        this._selectedPath = [];
        this._listeners = [];
    }
}
```

### 8.3 监听器函数丢失（WeakRef）

```typescript
private _printListenerToConsole(listener: FastEventListenerMeta) {
    const [fn] = listener;
    console.log(`监听器: ${fn.name || 'anonymous'}`);
    console.log(fn.toString());
    console.log(`执行次数: ${listener[2]}/${listener[1]}`);
    console.log(`标签: ${listener[3]}`);
}
```

### 8.4 树数据为空

```typescript
renderEmptyState() {
    return html`
        <div class="empty-state">
            ${this.renderIcon("listeners")}
            <p>暂无注册的监听器</p>
        </div>
    `;
}
```

### 8.5 拖动宽度越界

```typescript
private _handleResize(event: MouseEvent) {
    const newWidth = (offsetX / containerWidth) * 100;
    // 限制在 20% - 80% 之间
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    this._leftWidth = `${clampedWidth}%`;
}
```

## 9. 性能优化

### 9.1 树数据缓存

```typescript
private _treeDataCache: Map<string, TreeNode[]> = new Map();

private _buildTreeData() {
    const cacheKey = this.emitter?.options.id || 'default';
    if (this._treeDataCache.has(cacheKey)) {
        return this._treeDataCache.get(cacheKey)!;
    }
    // 构建树数据...
    this._treeDataCache.set(cacheKey, result);
    return result;
}
```

### 9.2 防抖刷新

```typescript
private _refreshTimeout?: number;

private _handleRefresh() {
    clearTimeout(this._refreshTimeout);
    this._refreshing = true;
    this._refreshTimeout = window.setTimeout(() => {
        this._buildTreeData();
        this._refreshing = false;
    }, 300);
}
```

### 9.3 展开/折叠状态记忆

```typescript
// 刷新时保持展开状态
private _buildTreeData() {
    const previousExpanded = new Set(this._expandedNodes);
    // ...构建新树
    this._expandedNodes = previousExpanded;
}
```

### 9.4 内存管理

- 监听器函数引用已经在 FastEvent 内部使用 WeakRef
- 组件不保留额外的强引用
- 使用 WeakMap 缓存避免内存泄漏

## 10. 测试策略

### 10.1 单元测试

- 树数据构建逻辑测试
- 节点选择逻辑测试
- 宽度计算和限制测试
- 边界情况处理测试

### 10.2 集成测试

- 与 FastEventViewer 的集成测试
- emitter 属性变化响应测试
- 暗色模式切换测试

### 10.3 视觉回归测试

- 树形结构渲染测试
- 监听器卡片布局测试
- 拖动条交互测试

## 11. 实施计划

### 11.1 实施步骤

1. **阶段 1: 基础结构**
   - 创建 listenerViewer/index.ts 和 styles.ts
   - 实现基础组件框架和样式

2. **阶段 2: 树形结构**
   - 实现树数据构建逻辑
   - 实现树节点渲染和交互
   - 添加展开/折叠功能

3. **阶段 3: 监听器列表**
   - 实现监听器卡片渲染
   - 添加控制台输出功能
   - 实现标签和元数据显示

4. **阶段 4: 交互功能**
   - 实现拖动调整宽度
   - 实现刷新功能
   - 添加加载动画

5. **阶段 5: 集成**
   - 修改 FastEventViewer 添加模式切换
   - 测试集成功能

6. **阶段 6: 测试和优化**
   - 编写单元测试
   - 性能优化
   - 样式微调

### 11.2 验收标准

- [ ] 树形结构正确显示所有事件路径
- [ ] 点击节点正确显示对应的监听器列表
- [ ] 拖动可以平滑调整左右宽度（20%-80%）
- [ ] 刷新按钮可以重新加载数据
- [ ] 点击函数名称可以在控制台输出函数信息
- [ ] 滚动条仅在鼠标悬停时显示，宽度为 2px
- [ ] 默认所有节点展开，默认宽度比例为 1:2
- [ ] 暗色模式正确应用
- [ ] 与 FastEventViewer 的模式切换工作正常

## 12. 附录

### 12.1 图标列表

从 `packages/components/src/styles/icons.css` 使用的图标：

- `listeners`: 监听器图标（树节点、工具栏）
- `refresh`: 刷新图标
- `folder` / `folder-open`: 树节点展开/折叠状态（可选）

### 12.2 参考

- Lit 文档: https://lit.dev/
- FastEvent 源码: `packages/native/src/event.ts`
- FastEventViewer 组件: `packages/viewer/src/eventViewer/index.ts`
- 监听器类型定义: `packages/native/src/types/FastEventListeners.ts`

### 12.3 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| 1.0 | 2026-03-19 | 初始设计 |
