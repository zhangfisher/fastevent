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
    - title: ⚡ High Performance
      details: Over 2x faster than EventEmitter2, optimized for high-frequency event handling
    - title: 🔍 Wildcard Patterns
      details: Powerful event pattern matching with single-level (*) and multi-level (**) wildcards
    - title: 🏗️ Hierarchical Scopes
      details: Nested event scopes with automatic path prefixing for better event organization
    - title: 🔄 Event Executors
      details: Flexible event execution strategies with customizable listener executors
    - title: 📝 Metadata System
      details: Rich metadata support at global, scope, and event levels with automatic merging
    - title: 💾 Retained Events
      details: Event persistence with automatic delivery to new subscribers
    - title: � Async Support
      details: First-class support for async event listeners and Promise-based operations
    - title: �️ Type Safety
      details: Comprehensive TypeScript support with strict type checking and autocompletion
    - title: 🎯 Event Filtering
      details: Built-in event filtering and conditional execution capabilities
    - title: 🔧 Lifecycle Hooks
      details: Complete listener lifecycle monitoring and debugging hooks
    - title: 🐞 Debug Tools
      details: Browser-based debugging tools for event flow visualization
    - title: � Pipe System
      details: Transform and decorate event listeners with powerful pipe operators
---