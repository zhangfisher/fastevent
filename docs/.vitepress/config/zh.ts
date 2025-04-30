export default {
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        outline: {
            label: "目录",
            level: [2, 5]
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: '首页', link: '/' },
            { text: '指南', link: '/zh/guide' },
            { text: '参考', link: '/zh/reference' },
            { text: '开源推荐', link: 'https://zhangfisher.github.io/repos/' },
        ],
        sidebar: {
            "/zh/guide/": [
                {
                    text: '开始',
                    collapsed: false,
                    items: [
                        { text: '安装', link: '/zh/guide/intro/install' },
                        { text: '快速入门', link: '/zh/guide/intro/get-started' },
                        { text: '更新历史', link: '/zh/guide/intro/history' },
                        { text: '获取支持', link: '/zh/guide/intro/support' },
                    ]
                },
                {
                    text: '指南',
                    collapsed: false,
                    items: [
                        {
                            collapsed: false,
                            items: [
                                { text: '触发事件', link: '/zh/guide/use/event-trigger' },
                                { text: '订阅事件', link: '/zh/guide/use/subscribe-events' },
                                { text: '取消订阅', link: '/zh/guide/use/off-events' },
                                { text: '事件作用域', link: '/zh/guide/use/scopes' },
                                { text: '元数据', link: '/zh/guide/use/metadata' },
                                { text: '切换语言', link: '/zh/guide/use/change-language' },
                                { text: '名称空间', link: '/zh/guide/use/namespace' },
                                { text: '记住切换语言', link: '/zh/guide/use/storage' },
                                { text: '一词多译', link: '/zh/guide/use/multi-translate' },
                            ]
                        },
                    ]
                }
            ],
            "/zh/reference/": [
                { text: '语言代码', link: '/zh/reference/lang-code' },
                { text: 'VoerkaI18nScope', link: '/zh/reference/i18nscope' },
                { text: 'VoerkaI18nManager', link: '/zh/reference/voerkai18n' },
            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/zhangfisher/voerka-i18n/' }
        ]

    }
}
