import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";

// 获取当前文件的目录路径
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        // 生成 TypeScript 类型声明文件
        dts({
            include: ["src/**/*"],
            outDir: "dist",
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "FasteventViewer",
            formats: ["es", "iife"],
            fileName: (format) => {
                // 对应 tsup 的输出文件名格式
                switch (format) {
                    case "es":
                        return "index.mjs";
                    case "iife":
                        return "index.js";
                    default:
                        return `index.${format}.js`;
                }
            },
        },
        rollupOptions: {
            treeshake: true,
            // 确保lit被打包进bundle（对应 tsup 的 noExternal: ["lit"]）
            external: [],
            output: {
                // 为不同格式配置 globals
                globals: {},
            },
        },
        // 生成 source maps
        sourcemap: true,
        // 压缩输出
        minify: "esbuild",
        // 清理输出目录
        emptyOutDir: true,
    },
    // TypeScript 配置
    esbuild: {
        target: "es2020",
    },
});
