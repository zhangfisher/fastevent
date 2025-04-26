import { defineConfig } from 'vitepress'

export default defineConfig({
    title: "FastEvent",
    description: "A powerful TypeScript event management library",

    themeConfig: {
        nav: [
            { text: 'Guide', link: '/guide/' },
            { text: 'API', link: '/api/' },
            { text: 'GitHub', link: 'https://github.com/zhangfisher/fastevent' }
        ],

        sidebar: {
            '/guide/': [
                {
                    text: 'Introduction',
                    items: [
                        { text: 'Getting Started', link: '/guide/' },
                        { text: 'Installation', link: '/guide/installation' }
                    ]
                },
                {
                    text: 'Core Concepts',
                    items: [
                        { text: 'Event Message', link: '/guide/event-message' },
                        { text: 'Event Scopes', link: '/guide/scopes' },
                        { text: 'Metadata System', link: '/guide/metadata' },
                        { text: 'Wildcards', link: '/guide/wildcards' }
                    ]
                },
                {
                    text: 'Advanced',
                    items: [
                        { text: 'Type Safety', link: '/guide/type-safety' },
                        { text: 'Retained Messages', link: '/guide/retained-messages' },
                        { text: 'Event Hooks', link: '/guide/hooks' }
                    ]
                }
            ],
            '/api/': [
                {
                    text: 'API Reference',
                    items: [
                        { text: 'FastEvent Class', link: '/api/' },
                        { text: 'FastEventScope Class', link: '/api/scope' },
                        { text: 'Types', link: '/api/types' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/zhangfisher/fastevent' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2023-present Zhang Fisher'
        },

        // 添加语言切换按钮
        localeLinks: {
            text: 'Language',
            items: [
                { text: 'English', link: '/' },
                { text: '简体中文', link: '/zh/' }
            ]
        }
    }
})