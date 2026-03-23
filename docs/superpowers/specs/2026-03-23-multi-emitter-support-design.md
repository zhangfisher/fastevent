# FastEvent Viewer 多 Emitter 支持设计文档

**日期:** 2026-03-23
**组件:** `fastevent-viewer`
**设计者:** Claude Code
**状态:** 📋 待实施

## 概述

为 `fastevent-viewer` 组件添加支持多个 FastEvent emitter 的功能，允许用户在下拉菜单中切换不同的 emitter，同时为每个 emitter 独立保存事件日志历史。

## 需求背景

当前 `fastevent-viewer` 仅支持单个 emitter 实例。在实际应用中，用户可能需要同时监控多个独立的事件系统（例如：用户事件、数据事件、系统事件），并能够在它们之间快速切换。

## 功能需求

### 1. Emitter 属性支持

- **输入类型:** `FastEvent | FastEvent[]`
- **向后兼容:** 单个 emitter 传入时保持现有行为
- **多个 emitter:** 传入数组时启用切换功能

### 2. UI 交互

- **单个 emitter:** 显示正常的标题文本
- **多个 emitter:**
  - 标题右侧显示下拉箭头图标
  - 点击标题区域打开下拉菜单
  - 菜单显示所有 emitter 的标题
  - 当前选中的 emitter 显示高亮和勾选图标
  - 点击菜单项切换 emitter
  - 点击外部区域关闭菜单

### 3. 日志管理

- 为每个 emitter 独立存储日志历史
- 切换 emitter 时恢复对应的日志
- 切换时清空当前显示并加载新 emitter 的历史
- 每个 emitter 的日志上限遵循 `max-size` 属性

### 4. 样式支持

- 完全支持亮色/暗黑模式
- 下拉菜单动画效果
- 响应式交互反馈

## 技术设计

### 1. 类型定义

```typescript
@property({ type: Object })
emitter?: FastEvent | FastEvent[];

@state()
private _emitters: FastEvent[] = [];

@state()
private _currentEmitterIndex = 0;

@state()
private _isDropdownOpen = false;

private _emitterLogs = new Map<number, EventLog[]>();
private _emitterLogIndexes = new Map<number, number[]>();
```

### 2. 组件属性访问器

```typescript
set emitter(value: FastEvent | FastEvent[] | undefined) {
    this._emitters = Array.isArray(value) ? value : value ? [value] : [];
    if (this._currentEmitterIndex >= this._emitters.length) {
        this._currentEmitterIndex = 0;
    }
}

get emitter(): FastEvent | FastEvent[] | undefined {
    return this._emitters.length === 1 ? this._emitters[0] : this._emitters;
}

private _getCurrentEmitter(): FastEvent | undefined {
    return this._emitters[this._currentEmitterIndex];
}
```

### 3. Emitter 切换逻辑

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

### 4. UI 渲染结构

```
.emitter-dropdown-container
  ├─ .emitter-dropdown-trigger (按钮)
  │   ├─ .header-title (标题)
  │   └─ .dropdown-arrow (箭头图标)
  └─ .emitter-dropdown-menu (下拉菜单)
      ├─ .emitter-menu-item (菜单项)
      │   ├─ .icon.yes (选中图标)
      │   └─ span (文本)
      └─ ...
```

### 5. 新增工具函数

**renderMenu.ts**

```typescript
export interface MenuItem {
    label: string;
    onClick: () => void;
    icon?: string;
    active?: boolean;
}

export function renderMenu(
    items: MenuItem[],
    options: MenuOptions = {},
): TemplateResult
```

### 6. 样式设计

#### 下拉容器

- 相对定位，flex: 1 占据剩余空间
- 暗黑模式适配

#### 触发按钮

- flexbox 布局，包含标题和箭头
- hover 状态：标题文字变蓝
- 平滑过渡动画

#### 箭头图标

- CSS border 实现
- 旋转动画（180度）
- 透明度 0.6

#### 下拉菜单

- 绝对定位
- 白色背景，边框和阴影
- 圆角 6px
- 淡入动画（fade + slide）
- z-index: 1000

#### 菜单项

- padding: 10px 16px
- hover: 浅灰背景
- active: 蓝色背景，蓝色文字，加粗
- 图标：绿色勾选图标

#### 暗黑模式

- 背景: #2a2a2a
- 边框: #404040
- hover 背景: rgba(255,255,255,0.06)
- active 背景: rgba(24,144,255,0.15)

### 7. 生命周期管理

```typescript
connectedCallback(): void {
    super.connectedCallback();
    setLanguage(this.lang);
    this._attach();
    // 添加全局点击监听器
    document.addEventListener('click', this._handleDocumentClick);
}

disconnectedCallback(): void {
    this._detach();
    document.removeEventListener('click', this._handleDocumentClick);
}

private _handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const dropdown = this.renderRoot?.querySelector('.emitter-dropdown-container');
    if (dropdown && !dropdown.contains(target)) {
        this._isDropdownOpen = false;
        this.requestUpdate();
    }
};
```

## 实施清单

### 文件修改

- [x] `packages/viewer/src/eventViewer/index.ts`
  - 修改 emitter 属性为 getter/setter
  - 添加新的 @state 属性
  - 添加 `_switchEmitter()` 方法
  - 添加 `_renderEmitterDropdown()` 方法
  - 添加 `_renderEmitterMenu()` 方法
  - 修改 `renderHeader()` 方法
  - 修改所有 `this.emitter` 为 `this._getCurrentEmitter()`
  - 添加全局点击监听器

- [x] `packages/viewer/src/eventViewer/styles.ts`
  - 添加下拉容器样式
  - 添加触发按钮样式
  - 添加箭头样式
  - 添加下拉菜单样式
  - 添加菜单项样式
  - 添加暗黑模式样式
  - 添加动画关键帧

- [x] `packages/viewer/src/utils/renderMenu.ts` (新建)
  - 导出 MenuItem 接口
  - 导出 MenuOptions 接口
  - 导出 renderMenu 函数

- [x] `packages/viewer/src/utils/index.ts`
  - 添加 `export * from "./renderMenu"`

- [x] `packages/viewer/example/index.ts`
  - 创建 userEmitter
  - 创建 dataEmitter
  - 创建 systemEmitter
  - 导出 multipleEmitters 数组
  - 添加触发函数

- [x] `packages/viewer/example/index.html`
  - 添加多 emitter 示例
  - 添加测试按钮

- [x] `packages/viewer/src/styles/icons.ts`
  - 添加下拉箭头图标（如需要）

## 测试用例

### 功能测试

1. **单个 emitter 向后兼容**
   - 传入单个 FastEvent 实例
   - 验证正常显示，无下拉箭头

2. **多个 emitter 基础功能**
   - 传入 FastEvent 数组
   - 验证显示下拉箭头
   - 点击打开菜单
   - 验证菜单显示所有 emitter

3. **Emitter 切换**
   - 点击不同菜单项
   - 验证切换成功
   - 验证日志正确切换
   - 验证菜单高亮更新

4. **日志独立性**
   - 在 emitter1 触发事件
   - 切换到 emitter2 触发事件
   - 切换回 emitter1
   - 验证日志保持独立

5. **外部点击关闭**
   - 打开下拉菜单
   - 点击外部区域
   - 验证菜单关闭

6. **暗黑模式**
   - 切换到暗黑模式
   - 验证所有样式正确应用

### 边界测试

1. 空数组输入
2. 重复切换同一 emitter
3. 快速连续切换
4. 切换时正在执行的事件

## 性能考虑

1. **日志存储:** 使用 Map 数据结构，O(1) 查找复杂度
2. **日志克隆:** 切换时使用浅拷贝 `[...array]`
3. **菜单渲染:** 仅在打开时渲染菜单 DOM
4. **事件监听:** 使用单个全局监听器处理外部点击

## 兼容性

- ✅ 向后兼容单个 emitter
- ✅ 不破坏现有 API
- ✅ 可选功能（仅传入数组时启用）
- ✅ 支持所有现有属性（dark, lang, maxSize 等）

## 未来扩展

1. 可选的 emitter 自定义显示名称
2. 菜单项分组
3. 搜索/过滤 emitter
4. Emitter 启用/禁用状态
5. 拖拽排序 emitter 顺序

## 参考资料

- Lit 生命周期: https://lit.dev/docs/components/lifecycle/
- 现有 renderButton 工具函数
- 现有样式系统（CSS 变量）

## 变更日志

- 2026-03-23: 初始设计文档创建
