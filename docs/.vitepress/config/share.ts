import { defineConfig } from 'vitepress';
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'

export default {
    base: '/fastevent/',
    title: 'FastEvent',
    description: '轻量级的事件订阅发布库',
    vue: {
        template: {
            compilerOptions: {
                whitespace: 'preserve'
            }
        }
    },
    markdown: {
        codeTransformers: [
            transformerTwoslash({
                // typesCache: createFileSystemTypesCache()
            })
        ],
        // Explicitly load these languages for types hightlighting
        languages: ['js', 'jsx', 'ts', 'tsx']
    }
}
