import { defineConfig } from "tsup";
// import copy from "esbuild-copy-files-plugin";

export default defineConfig({
    entry: {
        "fastevent.viewer": "src/index.ts",
    },
    format: ["esm", "cjs", "iife"],
    globalName: "FasteventViewer",
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
    noExternal: ["lit"],
    // esbuildPlugins: [
    //     copy({
    //         source: ["./dist/"],
    //         target: "../native/dist",
    //         copyWithFolder: true, // will copy "images" folder with all files inside
    //     }),
    // ],
});
