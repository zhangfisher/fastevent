import { defineConfig } from 'tsup'
// import copy from "esbuild-copy-files-plugin";


export default defineConfig([
    {
        entry: [
            'src/index.ts'
        ],
        format: ['esm', 'cjs'],
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: true,
        treeshake: true,
        minify: true
    }, {
        entry: [
            'src/devTools.ts'
        ],
        format: ['esm', 'cjs'],
        dts: true,
        splitting: false,
        sourcemap: true,
        noExternal: ['redux'],
        clean: true,
        treeshake: true,
        minify: true,
        tsconfig: "./tsconfig.devtool.json"
    }]
)
