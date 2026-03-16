export default {
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        outline: {
            label: "目录",
            level: [2, 5],
        },
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "首页", link: "/" },
            { text: "指南", link: "/zh/guide" },
            { text: "参考", link: "/zh/reference/index" },
            { text: "开源推荐", link: "https://zhangfisher.github.io/repos/" },
        ],
        sidebar: {
            "/zh/guide/": [
                {
                    text: "开始",
                    collapsed: false,
                    items: [
                        { text: "安装", link: "/zh/guide/intro/install" },
                        { text: "快速入门", link: "/zh/guide/intro/get-started" },
                        { text: "更新历史", link: "/zh/guide/intro/history" },
                        { text: "获取支持", link: "/zh/guide/intro/support" },
                    ],
                },
                {
                    text: "指南",
                    collapsed: false,
                    items: [
                        {
                            collapsed: false,
                            items: [
                                { text: "触发事件", link: "/zh/guide/use/event-trigger" },
                                { text: "订阅事件", link: "/zh/guide/use/subscribe-events" },
                                { text: "取消订阅", link: "/zh/guide/use/off-events" },
                                { text: "异步事件迭代", link: "/zh/guide/use/event-iterator" },
                                { text: "事件作用域", link: "/zh/guide/use/scopes" },
                                { text: "等待事件触发", link: "/zh/guide/use/waitfor" },
                                { text: "中止执行", link: "/zh/guide/use/abort" },
                                { text: "消息转换", link: "/zh/guide/use/transform" },
                                { text: "元数据", link: "/zh/guide/use/metadata" },
                                { text: "上下文", link: "/zh/guide/use/context" },
                                { text: "事件钩子", link: "/zh/guide/use/hooks" },
                                {
                                    text: "执行器",
                                    link: "/zh/guide/use/executors",
                                    collapsed: true,
                                    items: [
                                        {
                                            text: "parallel",
                                            link: "/zh/guide/use/executors/parallel",
                                        },
                                        { text: "race", link: "/zh/guide/use/executors/race" },
                                        {
                                            text: "balance",
                                            link: "/zh/guide/use/executors/balance",
                                        },
                                        { text: "series", link: "/zh/guide/use/executors/series" },
                                        {
                                            text: "waterfall",
                                            link: "/zh/guide/use/executors/waterfall",
                                        },
                                        { text: "random", link: "/zh/guide/use/executors/random" },
                                        { text: "first", link: "/zh/guide/use/executors/first" },
                                        { text: "last", link: "/zh/guide/use/executors/last" },
                                    ],
                                },
                                {
                                    text: "监听管道",
                                    link: "/zh/guide/use/pipes",
                                    collapsed: true,
                                    items: [
                                        { text: "timeout", link: "/zh/guide/use/pipes/timeout" },
                                        { text: "retry", link: "/zh/guide/use/pipes/retry" },
                                        { text: "queue", link: "/zh/guide/use/pipes/queue" },
                                        { text: "memorize", link: "/zh/guide/use/pipes/memorize" },
                                        { text: "throttle", link: "/zh/guide/use/pipes/throttle" },
                                        { text: "debounce", link: "/zh/guide/use/pipes/debounce" },
                                    ],
                                },
                                { text: "错误处理", link: "/zh/guide/use/error_handle" },
                                { text: "转发订阅", link: "/zh/guide/use/forward" },
                                { text: "类继承", link: "/zh/guide/use/inherit" },
                                { text: "Typescript", link: "/zh/guide/use/typescript" },
                                { text: "调试工具", link: "/zh/guide/use/devTools" },
                            ],
                        },
                    ],
                },
            ],
            "/zh/reference/": [
                {
                    text: "参考",
                    items: [
                        {
                            text: "FastEvent类",
                            collapsed: false,
                            items: [
                                {
                                    text: "构造函数",
                                    link: "/zh/reference/event/constructor",
                                },
                                {
                                    text: "属性",
                                    collapsed: false,
                                    items: [
                                        { text: "id", link: "/zh/reference/event/attrs/id" },
                                        {
                                            text: "options",
                                            link: "/zh/reference/event/attrs/options",
                                        },
                                        {
                                            text: "context",
                                            link: "/zh/reference/event/attrs/context",
                                        },
                                        {
                                            text: "listeners",
                                            link: "/zh/reference/event/attrs/listeners",
                                        },
                                        {
                                            text: "listenerCount",
                                            link: "/zh/reference/event/attrs/listenerCount",
                                        },
                                        {
                                            text: "retainedMessages",
                                            link: "/zh/reference/event/attrs/retainedMessages",
                                        },
                                        {
                                            text: "events",
                                            link: "/zh/reference/event/attrs/events",
                                        },
                                    ],
                                },
                                {
                                    text: "方法",
                                    collapsed: false,
                                    items: [
                                        { text: "emit", link: "/zh/reference/event/methods/emit" },
                                        {
                                            text: "emitAsync",
                                            link: "/zh/reference/event/methods/emitAsync",
                                        },
                                        { text: "on", link: "/zh/reference/event/methods/on" },
                                        { text: "once", link: "/zh/reference/event/methods/once" },
                                        {
                                            text: "onAny",
                                            link: "/zh/reference/event/methods/onAny",
                                        },
                                        { text: "off", link: "/zh/reference/event/methods/off" },
                                        {
                                            text: "offAll",
                                            link: "/zh/reference/event/methods/offAll",
                                        },
                                        {
                                            text: "clear",
                                            link: "/zh/reference/event/methods/clear",
                                        },
                                        {
                                            text: "waitfor",
                                            link: "/zh/reference/event/methods/waitfor",
                                        },
                                        {
                                            text: "scope",
                                            link: "/zh/reference/event/methods/scope",
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            text: "FastEventScope类",
                            collapsed: false,
                            items: [
                                {
                                    text: "构造函数",
                                    link: "/zh/reference/scope/constructor",
                                },
                                {
                                    text: "属性",
                                    collapsed: false,
                                    items: [
                                        {
                                            text: "prefix",
                                            link: "/zh/reference/scope/attrs/prefix",
                                        },
                                        {
                                            text: "context",
                                            link: "/zh/reference/scope/attrs/context",
                                        },
                                        {
                                            text: "options",
                                            link: "/zh/reference/scope/attrs/options",
                                        },
                                        {
                                            text: "events",
                                            link: "/zh/reference/scope/attrs/events",
                                        },
                                    ],
                                },
                                {
                                    text: "方法",
                                    collapsed: false,
                                    items: [
                                        { text: "emit", link: "/zh/reference/scope/methods/emit" },
                                        {
                                            text: "emitAsync",
                                            link: "/zh/reference/scope/methods/emitAsync",
                                        },
                                        { text: "on", link: "/zh/reference/scope/methods/on" },
                                        { text: "once", link: "/zh/reference/scope/methods/once" },
                                        {
                                            text: "onAny",
                                            link: "/zh/reference/scope/methods/onAny",
                                        },
                                        { text: "off", link: "/zh/reference/scope/methods/off" },
                                        {
                                            text: "offAll",
                                            link: "/zh/reference/scope/methods/offAll",
                                        },
                                        {
                                            text: "clear",
                                            link: "/zh/reference/scope/methods/clear",
                                        },
                                        {
                                            text: "waitfor",
                                            link: "/zh/reference/scope/methods/waitfor",
                                        },
                                        {
                                            text: "scope",
                                            link: "/zh/reference/scope/methods/scope",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        socialLinks: [{ icon: "github", link: "https://github.com/zhangfisher/fastevent/" }],
    },
};
