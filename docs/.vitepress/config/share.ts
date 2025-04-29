import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createFileSystemTypesCache } from '@shikijs/vitepress-twoslash/cache-fs'

export default {
    base: '/fastevent/',
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
