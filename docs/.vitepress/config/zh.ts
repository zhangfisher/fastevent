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
                                { text: '等待事件触发', link: '/zh/guide/use/waitfor' },
                                { text: '元数据', link: '/zh/guide/use/metadata' },
                                { text: '上下文', link: '/zh/guide/use/context' },
                                { text: '事件钩子', link: '/zh/guide/use/hooks' },
                                { text: '执行器', link: '/zh/guide/use/executor' },
                                { text: '监听管道', link: '/zh/guide/use/pipe' }
                            ]
                        },
                    ]
                }
            ],
            "/zh/reference/": [
                {
                    text: 'FastEvent',
                    collapsed: false, link: '/zh/reference/event',
                    items: [
                        {
                            text: '属性',
                            collapsed: false,
                            items: [
                                { text: 'id', link: '/zh/reference/event/attrs/id' },
                                { text: 'options', link: '/zh/reference/event/attrs/options' },
                                { text: 'context', link: '/zh/reference/event/attrs/context' },
                                { text: 'listeners', link: '/zh/reference/event/attrs/listeners' },
                                { text: 'listenerCount', link: '/zh/reference/event/attrs/listenerCount' },
                                { text: 'retainedMessages', link: '/zh/reference/event/attrs/retainedMessages' },
                            ]
                        },
                        {
                            text: '方法',
                            collapsed: false,
                            items: [
                                { text: 'emit', link: '/zh/reference/event/methods/emit' },
                                { text: 'emitAsync', link: '/zh/reference/event/methods/emitAsync' },
                                { text: 'on', link: '/zh/reference/event/methods/on' },
                                { text: 'once', link: '/zh/reference/event/methods/once' },
                                { text: 'onAny', link: '/zh/reference/event/methods/onAny' },
                                { text: 'off', link: '/zh/reference/event/methods/off' },
                                { text: 'offAll', link: '/zh/reference/event/methods/offAll' },
                                { text: 'waitfor', link: '/zh/reference/event/methods/waitfor' },
                                { text: 'scope', link: '/zh/reference/event/methods/scope' },
                            ]
                        }
                    ]
                },
                {
                    text: 'FastEventScope',
                    collapsed: false, link: '/zh/reference/scope'
                },
            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/zhangfisher/voerka-i18n/' }
        ]

    }
}
