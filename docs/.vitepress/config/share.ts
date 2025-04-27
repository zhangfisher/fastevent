import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import { createTwoslasher } from 'twoslash-eslint'

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
                explicitTrigger: /\beslint-check\b/,
            }),
            createTwoslasher({
                eslintConfig: [
                    {
                        files: ['**']
                    }
                ]
            })
        ],
        // Explicitly load these languages for types hightlighting
        languages: ['js', 'jsx', 'ts', 'tsx']
    }
}
