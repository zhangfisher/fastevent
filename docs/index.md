---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
    name: 'FastEvent'
    text: '事件触发器'
    actions:
        - theme: brand
          text: 快速入门
          link: /zh/guide/intro/get-started
        - theme: alt
          text: Github
          link: https://github.com/zhangfisher/fastevent

features:
    - title: ⚡ 极致性能
      details: 轻量级设计，体积仅10Kkb，执行效率比同类库快1倍以上
    - title: 🌲 层级事件
      details: 使用'/'分隔符支持多层级事件命名，让事件组织更清晰
    - title: � 智能匹配
      details: 支持单级(*)和多级(**)通配符，灵活订阅多个相关事件
    - title: 🏗️ 作用域管理
      details: 支持创建独立作用域，自动添加前缀，实现模块化事件管理
    - title: � 异步处理
      details: 内置异步事件支持，优雅处理Promise和并发执行
    - title: � 元数据系统
      details: 支持全局、作用域和事件级别的元数据，提供丰富的上下文信息
    - title: � 消息保留
      details: 可选的事件消息保留机制，确保后续订阅者不错过重要消息
    - title: 🎮 执行控制
      details: 灵活的事件执行器，支持Race/Balance等多种执行模式
    - title: 🎭 生命周期
      details: 完整的事件生命周期钩子，方便监控和调试
    - title: 🛡️ 类型安全
      details: 完整的TypeScript支持，享受代码提示和类型检查
    - title: 🔌 管道系统
      details: 灵活的事件处理管道，支持Timeout/retry等事件流转换和过滤
    - title: 🐞 开发调试
      details: 内置调试工具，帮助跟踪和排查事件问题
---