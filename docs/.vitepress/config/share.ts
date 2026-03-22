import path from "path";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { vitepressDemoPlugin } from "vitepress-demo-plugin";

export default {
    title: "FastEvent",
    description: "轻量级的事件订阅发布库",
    base: "/fastevent/",
    vue: {
        template: {
            compilerOptions: {
                whitespace: "preserve",
            },
        },
    },
    markdown: {
        config(md: any) {
            md.use(vitepressDemoPlugin, {
                demoDir: path.resolve(__dirname, "../../demos"),
                stackblitz: {
                    show: true,
                },
                codesandbox: {
                    show: true,
                },
            });
        },
        codeTransformers: [
            transformerTwoslash({
                // typesCache: createFileSystemTypesCache()
            }),
        ],
        // Explicitly load these languages for types hightlighting
        languages: ["js", "jsx", "ts", "tsx"],
    },
};
