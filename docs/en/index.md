---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
    name: 'FastEvent'
    text: 'Quick and powerful event emitter'
    actions:
        - theme: brand
          text: get-started
          link: /en/guide/intro/get-started
        - theme: alt
          text: Github
          link: https://github.com/zhangfisher/fastevent

features:
    - title: ⚡ Powerful
      details: 比 EventEmitter2 快 1 倍以上 
    - title: 🔍 通配符支持
      details: 强大的单级(\*)和多级(\*\*)通配符匹配
    - title: 🏗️ 层级作用域
      details: 嵌套作用域管理，自动路径前缀
    - title: 🔄 事件执行器
      details: 支持多种监听器事件执行器
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
