export default {
    link: '/en/',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        outline: {
            label: "TOC",
            level: [2, 5]
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'Home', link: '/en/' },
            { text: 'Guide', link: '/en/guide/index' },
            { text: 'Reference', link: '/en/reference/index' },
            { text: 'Open Source', link: 'https://zhangfisher.github.io/repos/' },
        ],
        sidebar: {
            "/en/guide/": [
                {
                    text: 'Start',
                    collapsed: false,
                    items: [
                        { text: 'Install', link: '/en/guide/intro/install' },
                        { text: 'Getting Started', link: '/en/guide/intro/get-started' },
                        { text: 'History', link: '/en/guide/intro/history' },
                        { text: 'Support', link: '/en/guide/intro/support' },
                    ]
                },
                {
                    text: 'Guide',
                    collapsed: false,
                    items: [
                        {
                            collapsed: false,
                            items: [
                                { text: 'Trigger', link: '/en/guide/use/event-trigger' },
                                { text: 'Subscribe', link: '/en/guide/use/subscribe-events' },
                                { text: 'off Events', link: '/en/guide/use/off-events' },
                                { text: 'Scope', link: '/en/guide/use/scopes' },
                                { text: 'WaitFor', link: '/en/guide/use/waitfor' },
                                { text: 'Abort', link: '/zh/guide/use/abort' },
                                { text: 'Metadata', link: '/en/guide/use/metadata' },
                                { text: 'Context', link: '/en/guide/use/context' },
                                { text: 'Hooks', link: '/en/guide/use/hooks' },
                                { text: 'Executor', link: '/en/guide/use/executor' },
                                { text: 'Error', link: '/en/guide/use/error_handle' },
                                { text: 'Pipe', link: '/en/guide/use/pipe' },
                                { text: 'Typescript', link: '/en/guide/use/typescript' },
                                { text: 'DevTools', link: '/en/guide/use/devTools' }
                            ]
                        },
                    ]
                }
            ],
            "/en/reference/": [
                {
                    text: 'Reference',
                    items: [
                        {
                            text: 'FastEvent',
                            collapsed: false,
                            items: [
                                {
                                    text: 'Constructor',
                                    link: '/en/reference/event/constructor',
                                },
                                {
                                    text: 'Properties',
                                    collapsed: false,
                                    items: [
                                        { text: 'id', link: '/en/reference/event/attrs/id' },
                                        { text: 'options', link: '/en/reference/event/attrs/options' },
                                        { text: 'context', link: '/en/reference/event/attrs/context' },
                                        { text: 'listeners', link: '/en/reference/event/attrs/listeners' },
                                        { text: 'listenerCount', link: '/en/reference/event/attrs/listenerCount' },
                                        { text: 'retainedMessages', link: '/en/reference/event/attrs/retainedMessages' },
                                        { text: 'events', link: '/en/reference/event/attrs/events' },
                                    ]
                                },
                                {
                                    text: 'Method',
                                    collapsed: false,
                                    items: [
                                        { text: 'emit', link: '/en/reference/event/methods/emit' },
                                        { text: 'emitAsync', link: '/en/reference/event/methods/emitAsync' },
                                        { text: 'on', link: '/en/reference/event/methods/on' },
                                        { text: 'once', link: '/en/reference/event/methods/once' },
                                        { text: 'onAny', link: '/en/reference/event/methods/onAny' },
                                        { text: 'off', link: '/en/reference/event/methods/off' },
                                        { text: 'offAll', link: '/en/reference/event/methods/offAll' },
                                        { text: 'clear', link: '/en/reference/event/methods/clear' },
                                        { text: 'waitfor', link: '/en/reference/event/methods/waitfor' },
                                        { text: 'scope', link: '/en/reference/event/methods/scope' },
                                    ]
                                }
                            ]
                        },
                        {
                            text: 'FastEventScope',
                            collapsed: false,
                            items: [
                                {
                                    text: 'Constructor',
                                    link: '/en/reference/scope/constructor',
                                },
                                {
                                    text: 'Properties',
                                    collapsed: false,
                                    items: [
                                        { text: 'prefix', link: '/en/reference/scope/attrs/prefix' },
                                        { text: 'context', link: '/en/reference/scope/attrs/context' },
                                        { text: 'options', link: '/en/reference/scope/attrs/options' },
                                        { text: 'events', link: '/en/reference/scope/attrs/events' },
                                    ]
                                },
                                {
                                    text: 'Method',
                                    collapsed: false,
                                    items: [
                                        { text: 'emit', link: '/en/reference/scope/methods/emit' },
                                        { text: 'emitAsync', link: '/en/reference/scope/methods/emitAsync' },
                                        { text: 'on', link: '/en/reference/scope/methods/on' },
                                        { text: 'once', link: '/en/reference/scope/methods/once' },
                                        { text: 'onAny', link: '/en/reference/scope/methods/onAny' },
                                        { text: 'off', link: '/en/reference/scope/methods/off' },
                                        { text: 'offAll', link: '/en/reference/scope/methods/offAll' },
                                        { text: 'clear', link: '/en/reference/scope/methods/clear' },
                                        { text: 'waitfor', link: '/en/reference/scope/methods/waitfor' },
                                        { text: 'scope', link: '/en/reference/scope/methods/scope' },
                                    ]
                                }
                            ]
                        },
                    ]
                },

            ]
        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/zhangfisher/fastevent/' }
        ]

    }
}
