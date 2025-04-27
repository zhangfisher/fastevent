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
          link: https://github.com/zhangfisher/voerka-i18n

features:
    - title: ⚡ 高性能
      details: 比 EventEmitter2 快 1 倍以上，体积仅 6~7kb
    - title: 🔍 通配符支持
      details: 强大的单级(\*)和多级(\*\*)通配符匹配
    - title: 🏗️ 层级作用域
      details: 嵌套作用域管理，自动路径前缀
    - title: 🔄 异步事件
      details: 原生支持 async/await 事件处理
    - title: 📝 元数据系统
      details: 全局/作用域/事件级别的元数据合并
    - title: 💾 保留消息
      details: 事件持久化，新订阅者自动获取
    - title: 🛠️ 完整 TypeScript 支持
      details: 严格类型检查，自动补全
    - title: 🔧 事件钩子
      details: 监听器生命周期监控和调试
    - title: 🐞 调试插件
      details: 浏览器调试插件，自动记录事件处理过程
---
