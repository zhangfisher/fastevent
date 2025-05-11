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
    },
    {
        entry: [
            'src/executors/index.ts'
        ],
        outDir: 'dist/executors',
        format: ['esm', 'cjs'],
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: true,
        treeshake: true,
        minify: true
    },
    {
        entry: [
            'src/pipes/index.ts'
        ],
        outDir: 'dist/pipes',
        format: ['esm', 'cjs'],
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: true,
        treeshake: true,
        minify: true
    },
    {
        entry: [
            'src/eventbus/index.ts'
        ],
        outDir: 'dist/eventbus',
        format: ['esm', 'cjs'],
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: true,
        treeshake: true,
        minify: true
    },
    {
        entry: [
            'src/devTools.ts'
        ],
        format: ['esm', 'cjs'],
        dts: false,
        splitting: false,
        sourcemap: true,
        noExternal: ['redux'],
        clean: true,
        treeshake: true,
        minify: true,
        tsconfig: "./tsconfig.devtool.json"
    }
])
