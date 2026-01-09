# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

FastEvent 是一个功能强大、类型安全、经过充分测试的事件发射器库，支持 Node.js 和浏览器环境。项目使用 TypeScript 开发，采用 Monorepo 架构。

## 核心架构

### 包结构

-   **packages/native**: 核心包，包含 FastEvent 主实现
    -   `src/event.ts`: FastEvent 核心类，事件监听器树管理
    -   `src/scope.ts`: FastEventScope 类，事件作用域实现
    -   `src/types/index.ts`: 核心类型定义
    -   `src/executors/`: 监听器执行器（parallel, race, series, waterfall, first, last, random, balance）
    -   `src/pipes/`: 监听器管道（queue, throttle, debounce, timeout, retry, memorize）
    -   `src/eventbus/`: EventBus 实现
    -   `src/utils/`: 工具函数
    -   `src/__tests__/`: 单元测试（320+ 测试用例，99%+ 覆盖率）
    -   `src/__benchmarks__`: 性能测试

### 核心设计概念

1. **监听器树结构**: 事件监听器以树形结构存储，支持层级事件命名（如 `user/login`）
2. **通配符支持**:
    - `*` 匹配单级路径（如 `user/*` 匹配 `user/login`）
    - `**` 匹配多级路径（如 `user/**` 匹配 `user/login`, `user/profile/update`）
3. **作用域（Scope）**: 共享父级监听器表，自动为事件名添加前缀，不是隔离的命名空间
4. **执行器（Executor）**: 控制监听器的执行方式（并行、串行、竞速等）
5. **管道（Pipe）**: 包装监听器函数以实现额外功能（队列、节流、重试等）
6. **保留事件**: 使用 `retain: true` 保留最后一次事件数据，新订阅者立即接收

## 常用命令

### 构建

```bash
# 构建所有包
bun run build

# 或使用 turbo
turbo build

# 构建 native 包
cd packages/native && bun run build
```

### 测试

```bash
# 运行所有测试
bun run test

# 运行测试并生成覆盖率报告
bun run test:coverage

# 运行单个测试文件
npx vitest run <test-file-path>

# 监听模式运行测试
npx vitest
```

### 性能测试

```bash
bun run bench
```

### 文档

```bash
# 启动文档开发服务器
bun run docs:dev

# 构建文档
bun run docs:build

# 预览文档
bun run docs:preview
```

### 发布

```bash
# 创建 changeset
bun run changeset

# 发布到 npm（先构建，再版本更新，最后发布）
bun run release

# 同步到 cnpm
bun run sync
```

## 开发指南

### 添加新功能时的注意事项

1. **类型安全**: 所有新功能必须有完整的 TypeScript 类型定义
2. **测试覆盖**: 必须为功能添加单元测试，确保覆盖率保持在 99%+
3. **向后兼容**: 不能破坏现有 API，新增功能通过可选参数或新方法实现
4. **文档更新**: 更新 README.md 和 docs/ 目录下的文档

### 核心文件说明

-   **src/event.ts**: FastEvent 主类，包含事件订阅/发布的核心逻辑

    -   `_addListener`: 添加监听器到树结构
    -   `_traverseToPath`: 遍历监听器树，支持通配符匹配
    -   `_executeListeners`: 执行匹配的监听器
    -   `emit`: 同步触发事件
    -   `emitAsync`: 异步触发事件（使用 Promise.allSettled）

-   **src/scope.ts**: FastEventScope 类
    -   作用域不创建新的监听器表，而是共享父级的监听器表
    -   `bind`: 绑定到 FastEvent 实例并设置前缀
    -   `_getScopeListener`: 包装监听器以处理前缀逻辑

### 类型系统

项目使用高级 TypeScript 类型特性：

-   **泛型约束**: Events, Meta, Context 三个泛型参数
-   **条件类型**: 根据 Transform 配置动态推导消息类型
-   **通配符展开**: `ExpandWildcard`, `WildcardEvents` 等类型工具
-   **作用域事件**: `ScopeEvents` 用于推导作用域的事件类型

### 代码注释语言

所有代码注释使用**中文**编写，保持与现有代码库一致。

## 发布流程

项目使用 Changesets 进行版本管理：

1. 使用 `bun run changeset` 创建 changeset，描述变更内容
2. 版本号会根据 changeset 自动升级（major/minor/patch）
3. 发布前会自动生成 CHANGELOG.md
4. 发布会同步到 cnpm 镜像

## 构建输出

-   **主包**: `dist/index.js`, `dist/index.mjs`, `dist/index.d.ts`
-   **Executors**: `dist/executors/*`
-   **Pipes**: `dist/pipes/*`
-   **EventBus**: `dist/eventbus/*`
-   **DevTools**: `devTools.js`, `devTools.mjs`

构建使用 `tsup`（基于 esbuild），输出 ESM 和 CJS 双格式，包含 TypeScript 类型定义和 source maps。

## 注意事项

-   使用 Bun 作为包管理器（`bun@1.3.5`）
-   Node.js 版本要求：ES2020+
-   测试框架：Vitest
-   代码风格：Biome（替代 ESLint/Prettier）
-   CI/CD：使用 GitHub Actions
